<script setup="">
    // core
    import {ref} from 'vue'

    // _global
    import {toCamelCase,numToDashString,dashStringToNum} from '../stores/_global'

    // components
    import MainPageWrapper from '../components/_MainPageWrapper/MainPageWrapper.vue'

    // axios
    import {axGet,axPost,axPatch,axRefreshId} from '../stores/_axios'

    // Add variations
    const flNeed=[
        "ageRating",
        "type",
        "releaseFormat",
        "transferStatus",
        "titleStatus",
        "other",
        "tags",
        "genres"
    ]
    let flLoaded
    ;(async ()=>{
        const params=new URLSearchParams();
        for (let filters of flNeed){
            params.append("name",filters)
        }
        flLoaded=ref(await axGet('comicsInfo/',params))
    })()
    let filterNum=ref()
    let variationName=ref('')
    let variationRuName=ref('')
    const addVariations=async ()=>{
        if (variationRuName.value===''){
            console.log('ruName не указан')
            return
        }
        if (variationName.value===''){
            variationName.value=toCamelCase(variationRuName.value)
        }
        for (let variationNum in flLoaded.value[filterNum.value].items){
            if (flLoaded.value[filterNum.value].items[variationNum].name==='info' && flLoaded.value[filterNum.value].items[variationNum].dontShow===true){
                await flLoaded.value[filterNum.value].items[variationNum].lastId++
                flLoaded.value[filterNum.value].items.push({
                    id:flLoaded.value[filterNum.value].items[variationNum].lastId,
                    sum:0,
                    name:variationName.value,
                    ruName:variationRuName.value
                })
                await axPatch('comicsInfo/'+flLoaded.value[filterNum.value].id,{items:flLoaded.value[filterNum.value].items})
                variationName.value=''
                variationRuName.value=''
                break
            }
        }
    }

    // pathEveryChapterInComics()
    const pathEveryChapterInComics=async ()=>{
        let comicsList=await axGet('comics/')
        for (let comicsNum in comicsList){
            for (let volumeNum in comicsList[comicsNum].contentIdList){
                for (let chapterNum in comicsList[comicsNum].contentIdList[volumeNum]) {
                    console.log(comicsList[comicsNum].contentIdList[volumeNum][chapterNum].chapterNum)

                    // comicsList[comicsNum].contentIdList[volumeNum][chapterNum].chapterNum=
                    //     comicsList[comicsNum].contentIdList[volumeNum][chapterNum].chapterNum
                    //         .toString().replace('.','-')

                    comicsList[comicsNum].contentIdList[volumeNum][chapterNum].chapterNum=
                        +comicsList[comicsNum].contentIdList[volumeNum][chapterNum].chapterNum
                            .replace('-','.')

                    console.log(comicsList[comicsNum].contentIdList[volumeNum][chapterNum].chapterNum)
                }
            }
            // await axPatch('comics/'+comicsList[comicsNum].id, {contentIdList:comicsList[comicsNum].contentIdList})
        }
        console.log('done')
    }

    //testBtn
    const testBtn=()=>{
        let i=2.5
        console.log(i)
        let j=numToDashString(i)
        console.log(j)
        let k=dashStringToNum(j)
        console.log(k)
    }
</script>

<template>
    <MainPageWrapper>
        <div class="wrapForAdmin">
            <form v-if="flLoaded!==undefined" @submit.prevent="addVariations" class="addVariations">
                <h1 class="addVariations__header">Add variations</h1>
                <br><br>
                <div class="addVariations_choiceFilterBlock">
                    <h2>filters</h2>
                    <div class="flexWrap">
                        <div
                                class="likeButton"
                                :class="{'likeButton-active':filterNum===filterIndex}"
                                v-for="(filterItem,filterIndex) in flLoaded"
                                @click="filterNum=filterIndex"
                        >
                            <p>{{filterItem.ruName}}</p>
                        </div>
                    </div>
                    <br><br>
                </div>
                <div v-if="filterNum!==undefined" class="addVariations_variationsList">
                    <h2>{{flLoaded[filterNum].ruName}}</h2>
                    <p
                            v-for="(variationItem,variationIndex) in flLoaded[filterNum].items.filter(val=>val.dontShow!==true)"
                    >{{variationItem.ruName}}: {{variationItem}}</p>
                    <br><br>
                </div>
                <div class="addVariations_addBlock" v-if="filterNum!==undefined">
                    <h2>ruName</h2>
                    <input type="text" v-model="variationRuName">
                    <h2>name</h2>
                    <input type="text" v-model="variationName" :placeholder="variationRuName===undefined?'':toCamelCase(variationRuName)">
                    <br><br>
                    <button type="submit">Add</button>
                </div>
            </form>

            <br><br>
            <h1>pathEveryChapterInComics()</h1>
            <button @click="pathEveryChapterInComics()">pathEveryChapterInComics()</button>

            <br><br>
            <button @click="testBtn()">testBtn()</button>
        </div>
    </MainPageWrapper>
</template>

<style lang="scss" scoped>
    .wrapForAdmin{
        padding: 40px;
    }
    .addVariations{
        &__header{}
        &_choiceFilterBlock{}
        &_variationsList{}
        &__addBlock{}
    }
</style>