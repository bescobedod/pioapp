import { useState } from 'react';
import { TextInput } from 'react-native-paper';
import { Control, Controller, FieldValues } from 'react-hook-form'
import { View, TextInput as RNTextInput, KeyboardTypeOptions, ReturnKeyTypeOptions, NativeSyntheticEvent, TextInputSubmitEditingEventData } from 'react-native'
import { Text, useTheme, HelperText } from 'react-native-paper';

type InputProps = {
    label?: string;
    placeholder?: string;
    maxLength?: number;
    // error?: boolean;
    isPassword?: boolean;
    control: any; 
    name: string;
    errors?: any;  
    disabled?: boolean;
    inputType?:KeyboardTypeOptions | undefined,
    counterWords?: boolean;
    returnKeyType?: ReturnKeyTypeOptions,
    onSubmitEditing?: ((e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void) | undefined;
    multiline?: boolean | undefined;
}

export default function InputFormHook({
    label = '',
    placeholder = '',
    maxLength = 50,
    // error = false,
    isPassword = false,
    control,
    name,
    errors = {},
    disabled = false,
    inputType,
    counterWords = false,
    returnKeyType,
    onSubmitEditing,
    multiline
} : InputProps){

    // const theme = useTheme()

    const [viewPassword, setViewPassword] = useState(isPassword)

    // const maxLengthComponent = (value: any) => { return (<TextInput.Affix text={`${value?.length || 0 }/${maxLength}`}/>) }

    // const passwordViewComponent = (<TextInput.Icon onPress={ () => setViewPassword(!viewPassword) } icon={ viewPassword ? 'eye-off' : 'eye' } />)

    const errorMessage = errors[name || ""]?.message || ""


    return (
        <View>
            <Controller 
                control={control}
                name={name}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      multiline={multiline}
                      keyboardType={inputType}
                      disabled={disabled}
                      mode="flat"
                      label={label}
                      placeholder={placeholder}
                    //   value={value ?? ""}
                      value={String(value ?? "")}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={viewPassword}
                      returnKeyType={returnKeyType}
                      onSubmitEditing={onSubmitEditing}
                    //   right={isPassword ? passwordViewComponent : maxLengthComponent(value)}
                      right={
                        isPassword ?
                            <TextInput.Icon onPress={ () => setViewPassword(!viewPassword) } icon={ viewPassword ? 'eye-off' : 'eye' } /> 
                            : (counterWords && <TextInput.Affix text={`${(value ?? "")?.length || 0 }/${maxLength}`}/>)
                      }
                      maxLength={maxLength}
                      error={errorMessage ? true : false}
                    />
                )}
            />

            { errorMessage && <HelperText type="error" visible={errorMessage ? true : false}>{ errorMessage }</HelperText> }
        </View>
    );
}