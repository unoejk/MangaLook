<script setup="">
    // core
    import {ref, onBeforeMount} from 'vue'

    // _global
    import {toCamelCase} from '../stores/_global'

    // components
    import MainPageWrapper from '../components/_MainPageWrapper/MainPageWrapper.vue'

    // router
    import router from "../routes";

    //pinia
    import {useComicsAddStore} from '../stores/comicsAdd'
    const {fastStartedFuncs,tryAdd,clearNewComics}=useComicsAddStore()
    // reactive pinia
    import {storeToRefs} from 'pinia'
    const {flLoadedSimple,flLoadedMultiple,newComics,mistakesArray}=storeToRefs(useComicsAddStore())
    // fast func from pinia
    let fsfLoaded=ref(false)
    fastStartedFuncs().finally(fsfLoaded.value=true)

    // overwrite
    let mistakesListOpen=ref(false)
    let doneMessageListOpen=ref(false)

    // addForm()
    const addForm=async ()=>{
        if (await tryAdd()){
            doneMessageListOpen.value=true
            console.log('done')
        }else {
            mistakesListOpen.value=true
        }
    }
    const downloadImg=({target})=>{
        const image=target.files[0]
        const reader=new FileReader()
        reader.readAsDataURL(image)
        reader.onload=e=>{
            newComics.value.imgFile=e.target.result
        }
        fakeElementsRef.value.imgFileName=target.files[0].name
    }

    // clearForm()
    const clearForm=()=>{
        clearNewComics()
        doneMessageListOpen.value=false
    }

    // goToComicsInfo()
    const goToComicsInfo=()=>{
        const newComicsId=newComics.value.id
        clearForm()
        router.push({name:'comics',params:{id:newComicsId}})
    }

    // fakeElements
    let fakeElementsRef=ref({})
</script>

<template>
    <MainPageWrapper>
        <div class="wrapForAdd" v-if="fsfLoaded">
            <form class="mainForm" @submit.prevent="addForm">
                <div>
                    <div>
                        <p>Название</p>
                        <input type="text" v-model="newComics.ruName" placeholder="текст">
                    </div>
                    <div>
                        <p>Название оригинала (опционально)</p>
                        <input type="text" v-model="newComics.orName" :placeholder="newComics.ruName===undefined?'':newComics.ruName">
                    </div>
                    <div>
                        <p>name (опционально)</p>
                        <input type="text" v-model="newComics.name" :placeholder="newComics.ruName===undefined?'':toCamelCase(newComics.ruName)">
                    </div>
                    <div>
                        <p>Год выпуска</p>
                        <input type="number" v-model="newComics.releaseYear" placeholder="номер">
                    </div>
                    <div>
                        <p>Обложка ссылкой</p>
                        <input type="text" v-model="newComics.img" placeholder="ссылка">
                    </div>
                    <div>
                        <p>Или Обложка файлом</p>
                        <div class="fakeInputFile" :loaded="fakeElementsRef.imgFileName!==undefined">
                            <span>{{fakeElementsRef.imgFileName===undefined?'файл':fakeElementsRef.imgFileName}}</span>
                            <input type="file" @change="downloadImg">
                        </div>
                    </div>
                </div>
                <div>
                    <div>
                        <p>Описание</p>
                        <textarea v-model="newComics.description" placeholder="текст"></textarea>
                    </div>
                </div>
                <div>
                    <div style="overflow: visible" v-for="(filterItem,filterIndex) in flLoadedSimple">
                        <p>{{filterItem.ruName}}</p>

                        <div class="fakeSelect" :isOpen="fakeElementsRef[filterItem.name]===true">
                            <button
                                    type="button"
                                    @click="[fakeElementsRef[filterItem.name]=!fakeElementsRef[filterItem.name]]"
                            >
                                {{newComics[filterItem.name]===undefined?'выбери меня':newComics[filterItem.name]}}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                                    <path d="M329.6 24c-18.4-32-64.7-32-83.2 0L6.5 440c-18.4 31.9 4.6 72 41.6 72H528c36.9 0 60-40 41.6-72l-240-416z"/></svg>
                            </button>
                            <transition name="demoTransition">
                                <div v-if="fakeElementsRef[filterItem.name]">
                                    <button
                                            type="button"
                                            v-for="(variationItem,variationIndex) in filterItem.items.filter(val=>val.dontShow!==true)"
                                            @click="[newComics[filterItem.name]=variationItem.name,fakeElementsRef[filterItem.name]=undefined]"
                                    >{{variationItem.ruName}}</button>
                                </div>
                            </transition>
                        </div>
                    </div>
                </div>
                <div v-if="fsfLoaded">
                    <div class="checksColumn" v-for="(filterItem,filterIndex) in flLoadedMultiple">
                        <p>{{filterItem.ruName+(filterItem.isRequired?'':' (опционально)')}}</p>
                        <input
                                v-if="filterItem.items.length>20"
                                type="text"
                                placeholder="поиск"
                                v-model="fakeElementsRef[filterItem.name]"
                        >
                        <div>
                            <button
                                    type="button"
                                    class="fakeDoubleCheckWithText"
                                    v-for="(variationItem,variationIndex) in (fakeElementsRef[filterItem.name]===undefined
                                ?filterItem.items.filter(val=>val.dontShow!==true)
                                :filterItem.items.filter(val=>val.dontShow!==true).
                                filter(val=>(val.ruName.toLowerCase().includes(fakeElementsRef[filterItem.name].toLowerCase()))))"
                                    :class="{
                                'fakeDoubleCheckWithText-noMatter':(newComics[filterItem.name].some(val=>(val===variationItem.name))===false),
                                'fakeDoubleCheckWithText-include':(newComics[filterItem.name].some(val=>(val===variationItem.name))===true)}"
                                    @click="
                                newComics[filterItem.name].some(val=>(val===variationItem.name))
                                ?newComics[filterItem.name].splice(newComics[filterItem.name].indexOf(variationItem.name),1)
                                :newComics[filterItem.name].push(variationItem.name)"
                            >
                                <div></div>
                                <span class="robotoLight">{{variationItem.ruName}}</span>
                            </button>
                        </div>
                    </div>
                </div>
                <button type="submit">Готово: добавляем комикс</button>
            </form>
            <transition name="demoTransition">
                <div class="mistakesList" v-if="mistakesListOpen">
                    <p v-for="(mistakesItem,mistakesIndex) in mistakesArray">{{mistakesItem}}</p>
                    <button type="button" @click="mistakesListOpen=false">Понятно</button>
                </div>
            </transition>
            <transition name="demoTransition">
                <div class="doneMessage" v-if="doneMessageListOpen">
                    <p>Готово</p>
                    <button type="button" @click="clearForm()">Понятно</button>
                    <button type="button" @click="[goToComicsInfo(),clearNewComics()]">На страницу комикса</button>
                </div>
            </transition>
        </div>
    </MainPageWrapper>
</template>

<style lang="scss" scoped>
    .wrapForAdd{}
    .mainForm{
        background-color: #3c3f41;
        border-radius: 15px;
        margin: 20px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        &>div{
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            row-gap: 20px;
            &>div{
                display: flex;
                width: fit-content;
                min-width: 250px;
                flex-direction: column;
                gap: 5px;
                flex-basis: 10px;
                flex-grow: 1;
                overflow: hidden;
                &>p{
                    white-space: nowrap;
                }
                &>input{}
                &>textarea{
                    width: 100%;
                    height: 200px;
                }
                &>button{}
            }
        }
        &>button{
            width: 100%;
        }
    }
    .fakeSelect{
        width: 100%;
        &>button{
            width: 100%;
            justify-content: space-between;
        }
        &>div{}
    }
    .checksColumn{
        &>div{
            max-height: 500px;
            overflow: auto;
        }
    }
</style>