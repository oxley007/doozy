import { Platform } from 'react-native';

const fonts = {
  bold: Platform.OS === 'ios' ? 'Inter 24pt Bold' : 'Inter-Bold',
  medium: Platform.OS === 'ios' ? 'Inter 24pt Medium' : 'Inter-Medium',
  regular: Platform.OS === 'ios' ? 'Inter 24pt Regular' : 'Inter-Regular',
};

export default fonts;
