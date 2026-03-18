import globalState from "helpers/states/globalState";
import { Skeleton } from "moti/skeleton";
import { View } from "react-native";

export default function SkeletonUser() {

    const { dark } = globalState()

    const colorMode:"dark" | "light" = dark ? 'dark' : 'light';

    return (
        <>
            <View className="mt-6 mb-12 w-full flex-col gap-5">

                <View className="w-full flex-col items-center">
                    <View style={{ position: 'relative' }}>
                        <View style={{ position: 'absolute', zIndex: 0, right: 1, top: 1 }}><Skeleton colorMode={colorMode} radius={"round"} width={30} height={30}/></View>
                        <Skeleton colorMode={colorMode} radius={"round"} width={100} height={100}/>
                    </View>
                    <View className="w-full flex-col items-center" style={{ marginTop: 20.5, gap: 11.5 }}>
                        <Skeleton colorMode={colorMode} width={50} height={10}/>
                        <Skeleton colorMode={colorMode} width={180} height={10}/>
                        <Skeleton colorMode={colorMode} width={80} height={10}/>
                    </View>
                </View>

                <View className="w-full" style={{ marginTop: 41, paddingHorizontal: 15 }}>
                    <View style={{ marginBottom: 31 }}><Skeleton colorMode={colorMode} width={70} height={10}/></View>
                    <View className="w-full flex-col" style={{ gap: 28.5 }}>
                        {
                            Array(1).fill(null).map((el, index) => (
                                <Skeleton key={index} colorMode={colorMode} width={'100%'} height={45}/>
                            ))
                        }
                    </View>
                </View>

                <View className="w-full" style={{ marginTop: 32, paddingHorizontal: 15 }}>
                    <View style={{ marginBottom: 31 }}><Skeleton colorMode={colorMode} width={70} height={10}/></View>
                    <View className="w-full flex-col" style={{ gap: 28.5 }}>
                        {
                            Array(3).fill(null).map((el, index) => (
                                <Skeleton key={index} colorMode={colorMode} width={'100%'} height={45}/>
                            ))
                        }
                    </View>
                </View>

            </View>
        </>
    )
}