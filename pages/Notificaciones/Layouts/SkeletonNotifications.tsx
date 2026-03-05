import globalState from "helpers/states/globalState";
import { Skeleton } from "moti/skeleton";
import { View } from "react-native";

export default function SkeletonNotifications () {

    const { dark } = globalState()
    
    const colorMode:"dark" | "light" = dark ? 'dark' : 'light';

    return (
        <>
            <View className="w-full flex-col mt-6 mb-10">
                <View className="w-full flex-row gap-2 mb-8">
                    <Skeleton colorMode={colorMode} height={29} width={72}/>
                    <Skeleton colorMode={colorMode} height={29} width={95}/>
                </View>
                <View className="w-full" style={{ marginBottom: 35 }}>
                    <Skeleton colorMode={colorMode} height={25} width={55}/>
                </View>
                <View className="w-full gap-6">
                    {
                        Array(4).fill(null).map((el, index) => (
                            <View className="w-full flex-col gap-1" key={index}>
                                <View style={{ marginLeft: 15 }}><Skeleton colorMode={colorMode} height={20} width={150}/></View>
                                <Skeleton colorMode={colorMode} height={75} width={'100%'}/> 
                            </View>
                        ))
                    }
                </View>
            </View>
        </>
    )
}