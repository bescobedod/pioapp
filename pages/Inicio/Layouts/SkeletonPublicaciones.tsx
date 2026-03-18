import React from 'react';
import globalState from "helpers/states/globalState";
import { Skeleton } from "moti/skeleton";
import { View } from "react-native";

export default function SkeletonPublicaciones() {
    const { dark } = globalState();
    const colorMode: "dark" | "light" = dark ? 'dark' : 'light';

    return (
        <View className="w-full flex-col mt-4">
            {
                Array(3).fill(null).map((_, index) => (
                    <View className="w-full flex-col mb-4" key={index} style={{ paddingHorizontal: 16 }}>
                        <Skeleton colorMode={colorMode} height={120} width={'100%'} />
                    </View>
                ))
            }
        </View>
    );
}
