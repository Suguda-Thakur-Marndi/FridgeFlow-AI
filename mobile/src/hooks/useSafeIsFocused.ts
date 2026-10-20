import { useContext, useState, useEffect } from 'react';
import { NavigationContext } from '@react-navigation/native';

export function useSafeIsFocused(): boolean {
  const navigation = useContext(NavigationContext);
  const [isFocused, setIsFocused] = useState<boolean>(() => (navigation ? navigation.isFocused() : true));

  useEffect(() => {
    if (!navigation) return;
    setIsFocused(navigation.isFocused());
    const unsubscribeFocus = navigation.addListener('focus', () => setIsFocused(true));
    const unsubscribeBlur = navigation.addListener('blur', () => setIsFocused(false));
    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation]);

  return isFocused;
}
