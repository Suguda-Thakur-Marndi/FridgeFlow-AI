package com.fridgeflow.ai

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.SystemClock
import com.facebook.react.bridge.*
import org.tensorflow.lite.Interpreter
import org.tensorflow.lite.nnapi.NnApiDelegate
import java.io.FileInputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.channels.FileChannel

class FridgeFlowEdgeAIModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var interpreter: Interpreter? = null
    private var isModelLoaded = false
    private val modelPath = "models/bundled-vlm/model_quantized.tflite"

    override fun getName(): String = "FridgeFlowEdgeAI"

    @ReactMethod
    fun isModelReady(promise: Promise) {
        promise.resolve(isModelLoaded || canLoadModel())
    }

    private fun canLoadModel(): Boolean {
        return try {
            reactContext.assets.openFd(modelPath).close()
            true
        } catch (e: Exception) {
            false
        }
    }

    @Synchronized
    private fun getOrInitInterpreter(): Interpreter {
        if (interpreter != null) return interpreter!!

        val fileDescriptor = reactContext.assets.openFd(modelPath)
        val inputStream = FileInputStream(fileDescriptor.fileDescriptor)
        val fileChannel = inputStream.channel
        val startOffset = fileDescriptor.startOffset
        val declaredLength = fileDescriptor.declaredLength
        val modelByteBuffer = fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength)

        val options = Interpreter.Options()
        // Try NNAPI hardware acceleration on Android, fallback to 4 XNNPACK threads
        try {
            options.addDelegate(NnApiDelegate())
        } catch (e: Exception) {
            options.setNumThreads(4)
        }

        val interp = Interpreter(modelByteBuffer, options)
        interpreter = interp
        isModelLoaded = true
        return interp
    }

    @ReactMethod
    fun analyzeImage(imageUriString: String, promise: Promise) {
        Thread {
            val startTime = SystemClock.elapsedRealtime()
            try {
                val interp = getOrInitInterpreter()

                // Decode bitmap from URI, data URL, or file
                val bitmap: Bitmap = when {
                    imageUriString.startsWith("data:") -> {
                        val base64Data = imageUriString.substringAfter("base64,")
                        val bytes = android.util.Base64.decode(base64Data, android.util.Base64.DEFAULT)
                        BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                    }
                    imageUriString.startsWith("content://") || imageUriString.startsWith("file://") -> {
                        val uri = Uri.parse(imageUriString)
                        val stream = reactContext.contentResolver.openInputStream(uri)
                        BitmapFactory.decodeStream(stream)
                    }
                    else -> {
                        BitmapFactory.decodeFile(imageUriString)
                    }
                } ?: throw IllegalArgumentException("Could not decode image bitmap from URI: $imageUriString")

                // Scale to 224x224 RGB
                val scaledBitmap = Bitmap.createScaledBitmap(bitmap, 224, 224, true)

                // Fill Float32 input tensor [1, 224, 224, 3] normalized [0, 1]
                val inputBuffer = ByteBuffer.allocateDirect(1 * 224 * 224 * 3 * 4)
                inputBuffer.order(ByteOrder.nativeOrder())
                val intValues = IntArray(224 * 224)
                scaledBitmap.getPixels(intValues, 0, 224, 0, 0, 224, 224)

                for (pixelValue in intValues) {
                    val r = ((pixelValue shr 16) and 0xFF) / 255.0f
                    val g = ((pixelValue shr 8) and 0xFF) / 255.0f
                    val b = (pixelValue and 0xFF) / 255.0f
                    inputBuffer.putFloat(r)
                    inputBuffer.putFloat(g)
                    inputBuffer.putFloat(b)
                }

                // Output tensor [1, 10]
                val outputBuffer = ByteBuffer.allocateDirect(1 * 10 * 4)
                outputBuffer.order(ByteOrder.nativeOrder())

                interp.run(inputBuffer, outputBuffer)
                outputBuffer.rewind()

                val scores = FloatArray(10)
                outputBuffer.asFloatBuffer().get(scores)

                val elapsed = SystemClock.elapsedRealtime() - startTime

                val scoresArray = Arguments.createArray()
                for (s in scores) {
                    scoresArray.pushDouble(s.toDouble())
                }

                val resultMap = Arguments.createMap().apply {
                    putArray("rawScores", scoresArray)
                    putInt("inferenceDurationMs", elapsed.toInt())
                    putString("runtime", "litert-nnapi")
                    putString("modelIdentifier", "bundled-vision-vlm")
                    putString("modelVersion", "1.0.0-bundled")
                    putBoolean("isLive", true)
                }

                promise.resolve(resultMap)
            } catch (e: Exception) {
                promise.reject("INFERENCE_ERROR", "On-device LiteRT inference failed: ${e.message}", e)
            }
        }.start()
    }

    @ReactMethod
    fun unloadModel(promise: Promise) {
        try {
            interpreter?.close()
            interpreter = null
            isModelLoaded = false
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("UNLOAD_ERROR", e.message, e)
        }
    }
}
