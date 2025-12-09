import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledTouchable = styled(TouchableOpacity);
const StyledText = styled(Text);

const GoToCarbnMapButton = () => {
  const navigation = useNavigation<any>();

  return (
    <StyledView className="p-4">
      <StyledTouchable
        className="bg-blue-500 px-5 py-3 rounded-lg shadow-md"
        onPress={() => navigation.navigate('CarbnMapScreen')}
      >
        <StyledText className="text-white text-lg font-semibold text-center">
          View Carbn Map
        </StyledText>
      </StyledTouchable>

      <StyledView className="bg-blue-500 p-4 mt-4 rounded-lg">
        <StyledText className="text-white">Hello</StyledText>
      </StyledView>
    </StyledView>
  );
};

export default GoToCarbnMapButton;
