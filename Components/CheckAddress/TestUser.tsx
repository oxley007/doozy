import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { useDispatch, useSelector, Provider } from 'react-redux';
import store, { RootState, setUserDetails } from '../../store/store';

export default function TestUser() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const [input, setInput] = useState('');

  const updateName = () => {
    dispatch(setUserDetails({ name: input }));
  };

  const logName = () => {
    console.log('Redux user:', store.getState().user);
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        label="Name"
        value={input}
        onChangeText={setInput}
        style={{ marginBottom: 10 }}
      />
      <Button mode="contained" onPress={updateName} style={{ marginBottom: 10 }}>
        Update Name
      </Button>
      <Button mode="outlined" onPress={logName} style={{ marginBottom: 10 }}>
        Log Redux State
      </Button>

      <Text>Current name in Redux: {user.name}</Text>
    </View>
  );
};
