<script setup="">
    // core
    import {ref} from "vue";

    // _global
    import {numToDashString,dashStringToNum} from '../stores/_global'

    // axios
    import {axGet,axPatch} from '../stores/_axios.js'

    // router
    import {useRouter, useRoute} from 'vue-router'
    const router=useRouter()
    const route=useRoute()
    const toAnotherChapter=(volume,chapterNum)=>{
        window.scrollTo({top:0,behavior:"smooth"})
        router.push({name:'content',params:{
            id:route.params.id,
            volume:volume+1,
            chapter:numToDashString(chapterNum)
        }})
        setTimeout(()=>{
            fsf()
        },1)
    }

    //pinia
    import {useRegisterStore} from '../stores/register'
    const {tryAutoLogged}=useRegisterStore()
    // reactive pinia
    import {storeToRefs} from 'pinia'
    const {getLoggedInfo}=storeToRefs(useRegisterStore())

    // baseInfo
    const baseInfo={
        volume:undefined,
        chapterNum:undefined,
        previousChapterRef:ref({volume:undefined,chapter:undefined}),
        nextChapterRef:ref({volume:undefined,chapter:undefined}),
        pageActualRef:ref(undefined),
    }

    // fsf (load comics and chapter)
    let comics=undefined
    let chapter=undefined
    let fsfLoaded=ref(false)
    let isSetPageActualRefOnLust=false
    const fsf=async ()=>{
        baseInfo.volume=Number(route.params.volume)-1
        baseInfo.chapterNum=dashStringToNum(route.params.chapter)
        comics=await axGet('comics/'+route.params.id)
            .catch(()=>{router.push({name:'pageNotFound'})})
        const requestedChapter=comics.contentIdList[baseInfo.volume].find(val=>val.chapterNum===baseInfo.chapterNum)
        if (requestedChapter===undefined){await router.push({name:'pageNotFound'});return}
        chapter=await axGet('content/'+requestedChapter.neededId)
            .catch(()=>{router.push({name:'pageNotFound'})})
        if (chapter===undefined){await router.push({name:'pageNotFound'});return}

        fsfLoaded.value=true

        // задаём стартавую страницу
        if (isSetPageActualRefOnLust){
            baseInfo.pageActualRef.value=chapter.images.length-1
            isSetPageActualRefOnLust=false
        }else {
            baseInfo.pageActualRef.value=0
        }

        // ищем соседние главы
        const actualVolumeArray=comics.contentIdList[baseInfo.volume]
        const actualPosition=actualVolumeArray.findIndex(chapterInVolumeArray=>chapterInVolumeArray.chapterNum===baseInfo.chapterNum)
        if (actualVolumeArray[actualPosition-1]!==undefined){
            baseInfo.previousChapterRef.value.volume=baseInfo.volume
            baseInfo.previousChapterRef.value.chapter=actualVolumeArray[actualPosition-1].chapterNum
        }else {
            const previousVolumeArray=comics.contentIdList[baseInfo.volume-1]
            if(previousVolumeArray!==undefined){
                baseInfo.previousChapterRef.value.volume=baseInfo.volume-1
                baseInfo.previousChapterRef.value.chapter=previousVolumeArray[previousVolumeArray.length-1].chapterNum
            }else {
                baseInfo.previousChapterRef.value.volume=undefined
                baseInfo.previousChapterRef.value.chapter=undefined
            }
        }
        if (actualVolumeArray[actualPosition+1]!==undefined){
            baseInfo.nextChapterRef.value.volume=baseInfo.volume
            baseInfo.nextChapterRef.value.chapter=actualVolumeArray[actualPosition+1].chapterNum
        }else {
            const previousVolumeArray=comics.contentIdList[baseInfo.volume+1]
            if(previousVolumeArray!==undefined){
                baseInfo.nextChapterRef.value.volume=baseInfo.volume+1
                baseInfo.nextChapterRef.value.chapter=previousVolumeArray[0].chapterNum
            }else {
                baseInfo.nextChapterRef.value.volume=undefined
                baseInfo.nextChapterRef.value.chapter=undefined
            }
        }
    }
    fsf()

    // visibility of the chapters and settings block
    let chaptersOpen=ref(false)
    let settingsOpen=ref(false)

    // fakeSelectorsRef
    let fakeSelectorsRef=ref({
        choicePage:{
            isOpen:false,
        },
        settings:{
            readingMode:'pageByPage',
            // readingMode:'entirely',
            containerWidthMin: 480,
            containerWidthMax: 1920,
            containerWidth: 1080,
            reducingLargePictures:'include',
            // reducingLargePictures:'exclude'',
            // increasingSmallPictures:'include',
            increasingSmallPictures:'exclude',
            pageSwitchingArea:'fullScreen',
            // pageSwitchingArea:'image',
        }
    })

    // settingsBlock
    let settingsChecked=ref(false)
    ;(async ()=>{
        await tryAutoLogged()
        if (getLoggedInfo.value.isLogged){
            const userSettings=getLoggedInfo.value.loggedUser.viewSettings
            if (userSettings.readingMode!==undefined){
                fakeSelectorsRef.value.settings.readingMode=userSettings.readingMode
            }
            if (userSettings.containerWidth!==undefined){
                fakeSelectorsRef.value.settings.containerWidth=userSettings.containerWidth
            }
            if (userSettings.reducingLargePictures!==undefined){
                fakeSelectorsRef.value.settings.reducingLargePictures=userSettings.reducingLargePictures
            }
            if (userSettings.increasingSmallPictures!==undefined){
                fakeSelectorsRef.value.settings.increasingSmallPictures=userSettings.increasingSmallPictures
            }
            if (userSettings.pageSwitchingArea!==undefined){
                fakeSelectorsRef.value.settings.pageSwitchingArea=userSettings.pageSwitchingArea
            }
        }
        // дефолтные настройки ползунка
        if (fakeSelectorsRef.value.settings.containerWidthMin>window.screen.width){
            fakeSelectorsRef.value.settings.containerWidthMin=0
        }
        fakeSelectorsRef.value.settings.containerWidthMax=window.screen.width
        if (fakeSelectorsRef.value.settings.containerWidth>window.screen.width){
            fakeSelectorsRef.value.settings.containerWidth=((fakeSelectorsRef.value.settings.containerWidthMax-fakeSelectorsRef.value.settings.containerWidthMin)/2)+fakeSelectorsRef.value.settings.containerWidthMin
        }
        // ----
        settingsChecked.value=true
    })()
    const changeUserSettings=async ()=>{
        await axPatch('users/'+getLoggedInfo.value.loggedUser.id,{
            viewSettings:fakeSelectorsRef.value.settings,
        })
    }


    // scroll
    let headerIsTransparent=ref(false)
    let previousScrollHeight=0
    window.addEventListener('scroll', function() {
        // window.scrollTo(0,0)
        const newScrollHeight=document.scrollingElement.scrollTop
        headerIsTransparent.value=newScrollHeight>previousScrollHeight && newScrollHeight>50;
        previousScrollHeight=newScrollHeight
    });

    // handleNav
    const closeSlides=()=>{
        chaptersOpen.value=false
        settingsOpen.value=false
        fakeSelectorsRef.value.choicePage.isOpen=false
    }
    const handlePrevious=()=>{
        if (fakeSelectorsRef.value.settings.readingMode==='pageByPage'){
            if (baseInfo.pageActualRef.value!==0){
                baseInfo.pageActualRef.value=baseInfo.pageActualRef.value-1
            }else {
                if (baseInfo.previousChapterRef.value.chapter!==undefined){
                    isSetPageActualRefOnLust=true
                    toAnotherChapter(baseInfo.previousChapterRef.value.volume,baseInfo.previousChapterRef.value.chapter)
                }
            }
        }else {
            if (baseInfo.previousChapterRef.value.chapter!==undefined){
                isSetPageActualRefOnLust=true
                toAnotherChapter(baseInfo.previousChapterRef.value.volume,baseInfo.previousChapterRef.value.chapter)
            }
        }
    }
    const handleNext=()=>{
        if (fakeSelectorsRef.value.settings.readingMode==='pageByPage'){
            if (baseInfo.pageActualRef.value!==chapter.images.length-1){
                baseInfo.pageActualRef.value=baseInfo.pageActualRef.value+1
            }else {
                if (baseInfo.nextChapterRef.value.chapter!==undefined){
                    toAnotherChapter(baseInfo.nextChapterRef.value.volume,baseInfo.nextChapterRef.value.chapter)
                }
            }
        }else {
            if (baseInfo.nextChapterRef.value.chapter!==undefined){
                toAnotherChapter(baseInfo.nextChapterRef.value.volume,baseInfo.nextChapterRef.value.chapter)
            }
        }
    }
</script>

<template>
    <div class="wrapForContent" v-if="fsfLoaded" >
        <!-- z-index: 2; start -->
        <div class="header" :class="{'header-transparent':headerIsTransparent}">
            <div class="header_left" @click="router.push({name:'comics',params:{id:route.params.id}})">
                <button class="header_left_toComics">
                    <p class="header_left_toComics__orName">{{comics.orName}}</p>
                    <p class="header_left_toComics__ruName">{{comics.ruName}}</p>
                </button>
            </div>
            <div class="header_center">
                <button
                        class="header_center_previousChapter"
                        :class="{'header_center__previousChapter-disActive':baseInfo.previousChapterRef.value.chapter===undefined}"
                        :disabled="baseInfo.previousChapterRef.value.chapter===undefined"
                        @click="toAnotherChapter(baseInfo.previousChapterRef.value.volume,baseInfo.previousChapterRef.value.chapter)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                        <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/></svg>
                </button>
                <button class="header_center_chaptersNav" @click="chaptersOpen=!chaptersOpen">
                    <p class="header_center_chaptersNav__header">Оглавление</p>
                    <p class="header_center_chaptersNav__name">{{'Том '+(baseInfo.volume+1)+' Глава '+baseInfo.chapterNum}}</p>
                </button>
                <button
                        class="header_center_nextChapter"
                        :class="{'header_center__nextChapter-disActive':baseInfo.nextChapterRef.value.chapter===undefined}"
                        :disabled="baseInfo.nextChapterRef.value.chapter===undefined"
                        @click="toAnotherChapter(baseInfo.nextChapterRef.value.volume,baseInfo.nextChapterRef.value.chapter)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                        <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/></svg>
                </button>
            </div>
            <div class="header_right">
                <button class="header_right_settings" @click="settingsOpen=!settingsOpen">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>
                </button>
            </div>
        </div>
        <div
                class="choicePage fakeSelect-reverse"
                :isOpen="fakeSelectorsRef.choicePage.isOpen"
                v-if="fakeSelectorsRef.settings.readingMode==='pageByPage'"
        >
            <button
                    @click="[fakeSelectorsRef.choicePage.isOpen=!fakeSelectorsRef.choicePage.isOpen,]"
            >
                {{'Страница '+(baseInfo.pageActualRef.value+1)+' / '+chapter.images.length}}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                    <path d="M329.6 24c-18.4-32-64.7-32-83.2 0L6.5 440c-18.4 31.9 4.6 72 41.6 72H528c36.9 0 60-40 41.6-72l-240-416z"/></svg>
            </button>
            <transition name="demoTransition">
                <div v-if="fakeSelectorsRef.choicePage.isOpen">
                    <button
                            v-for="(optionItem,optionIndex) in chapter.images"
                            @click="[baseInfo.pageActualRef.value=optionIndex,fakeSelectorsRef.choicePage.isOpen=false]"
                    >{{'Страница '+(optionIndex+1)}}</button>
                </div>
            </transition>
        </div>
        <div class="settingsBlock" :isOpen="settingsOpen">
            <div class="settingsBlock_header">
                <h2 class="settingsBlock_header__name">Настройки</h2>
                <button class="settingsBlock_header_close" @click="settingsOpen=false">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                        <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                </button>
            </div>
            <div class="settingsBlock_content" v-if="settingsChecked">
                <div class="settingsBlock_content_readingMode">
                    <p class="settingsBlock_content_readingMode__title">Режим чтения</p>
                    <div class="settingsBlock_content_readingMode_buttonsBlock fakeRadioButtonsBlock">
                        <button
                                class="settingsBlock_content_readingMode_buttonsBlock__button"
                                :isChoiced="fakeSelectorsRef.settings.readingMode==='pageByPage'"
                                @click="[fakeSelectorsRef.settings.readingMode='pageByPage',getLoggedInfo.isLogged?changeUserSettings():'']"
                        >Постранично</button>
                        <button
                                class="settingsBlock_content_readingMode_buttonsBlock__button"
                                :isChoiced="fakeSelectorsRef.settings.readingMode==='entirely'"
                                @click="[fakeSelectorsRef.settings.readingMode='entirely',getLoggedInfo.isLogged?changeUserSettings():'']"
                        >Глава целиком</button>
                    </div>
                </div>
                <div class="settingsBlock_content_containerWidth">
                    <p class="settingsBlock_content_containerWidth__title">Ширина контейнера <span>{{fakeSelectorsRef.settings.containerWidth}}px</span></p>
                    <input
                            class="settingsBlock_content_containerWidth__slider"
                            type="range" step="10"
                            :min="fakeSelectorsRef.settings.containerWidthMin"
                            :max="fakeSelectorsRef.settings.containerWidthMax"
                            v-model="fakeSelectorsRef.settings.containerWidth"
                            @change="getLoggedInfo.isLogged?changeUserSettings():''"
                    >
                </div>
                <div class="settingsBlock_content_reducingLargePictures">
                    <p class="settingsBlock_content_reducingLargePictures__title">Уменьшение больших картинок</p>
                    <div class="settingsBlock_content_reducingLargePictures_buttonsBlock fakeRadioButtonsBlock">
                        <button
                                class="settingsBlock_content_reducingLargePictures_buttonsBlock__button"
                                :isChoiced="fakeSelectorsRef.settings.reducingLargePictures==='include'"
                                @click="[fakeSelectorsRef.settings.reducingLargePictures='include',getLoggedInfo.isLogged?changeUserSettings():'']"
                        >Включено</button>
                        <button
                                class="settingsBlock_content_reducingLargePictures_buttonsBlock__button"
                                :isChoiced="fakeSelectorsRef.settings.reducingLargePictures==='exclude'"
                                @click="[fakeSelectorsRef.settings.reducingLargePictures='exclude',getLoggedInfo.isLogged?changeUserSettings():'']"
                        >Выключено</button>
                    </div>
                </div>
                <div class="settingsBlock_content_increasingSmallPictures">
                    <p class="settingsBlock_content_increasingSmallPictures__title">Увеличение маленьких картинок</p>
                    <div class="settingsBlock_content_increasingSmallPictures_buttonsBlock fakeRadioButtonsBlock">
                        <button
                                class="settingsBlock_content_increasingSmallPictures_buttonsBlock__button"
                                :isChoiced="fakeSelectorsRef.settings.increasingSmallPictures==='include'"
                                @click="[fakeSelectorsRef.settings.increasingSmallPictures='include',getLoggedInfo.isLogged?changeUserSettings():'']"
                        >Включено</button>
                        <button
                                class="settingsBlock_content_increasingSmallPictures_buttonsBlock__button"
                                :isChoiced="fakeSelectorsRef.settings.increasingSmallPictures==='exclude'"
                                @click="[fakeSelectorsRef.settings.increasingSmallPictures='exclude',getLoggedInfo.isLogged?changeUserSettings():'']"
                        >Выключено</button>
                    </div>
                </div>
                <div class="settingsBlock_content_pageSwitchingArea">
                    <p class="settingsBlock_content_pageSwitchingArea__title">Область переключения страниц</p>
                    <div class="settingsBlock_content_pageSwitchingArea_buttonsBlock fakeRadioButtonsBlock">
                        <button
                                class="settingsBlock_content_pageSwitchingArea_buttonsBlock__button"
                                :isChoiced="fakeSelectorsRef.settings.pageSwitchingArea==='fullScreen'"
                                @click="[fakeSelectorsRef.settings.pageSwitchingArea='fullScreen',getLoggedInfo.isLogged?changeUserSettings():'']"
                        >Весь экран</button>
                        <button
                                class="settingsBlock_content_pageSwitchingArea_buttonsBlock__button"
                                :isChoiced="fakeSelectorsRef.settings.pageSwitchingArea==='image'"
                                @click="[fakeSelectorsRef.settings.pageSwitchingArea='image',getLoggedInfo.isLogged?changeUserSettings():'']"
                        >Картинка</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="chaptersBlock" :isOpen="chaptersOpen">
            <div class="chaptersBlock_header">
                <h2 class="chaptersBlock_header__name">Оглавление</h2>
                <button class="chaptersBlock_header_close" @click="chaptersOpen=false">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                        <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                </button>
            </div>
            <div class="chaptersBlock_content">
                <ul v-for="(volumeItem,volumeIndex) in comics.contentIdList" class="chaptersBlock_content_volume">
                    <li
                            v-for="(chapterItem,chapterIndex) in comics.contentIdList[volumeIndex]"
                            class="chaptersBlock_content_volume__chapter"
                            @click="[toAnotherChapter(volumeIndex,chapterItem.chapterNum),chaptersOpen=false]"
                    >
                        {{'Том '+(volumeIndex+1)+' Глава '+chapterItem.chapterNum+(chapterItem.ruName!==undefined?' — '+chapterItem.ruName:'')}}
                    </li>
                </ul>
            </div>
        </div>
        <!-- z-index: 2; end -->
        <div class="main">
            <div class="main_contentList" :style="'width: '+fakeSelectorsRef.settings.containerWidth+'px'">
                <div
                        class="main_contentList_imgContainer"
                        :class="{
                            'main_contentList_imgContainer-reduce':fakeSelectorsRef.settings.reducingLargePictures==='include',
                            'main_contentList_imgContainer-increase':fakeSelectorsRef.settings.increasingSmallPictures==='include',
                            }"
                        v-for="(imgItem,imgIndex) in (fakeSelectorsRef.settings.readingMode==='pageByPage'
                            ?chapter.images[baseInfo.pageActualRef.value]
                            :chapter.images.flat())"
                >
                    <img
                            class="main_contentList_imgContainer__img"
                            :src="(fakeSelectorsRef.settings.readingMode==='pageByPage'
                                ?chapter.images[baseInfo.pageActualRef.value][imgIndex]
                                :chapter.images.flat()[imgIndex])"
                            alt=""
                    >
                    <div class="main_contentList_imgContainer_handleNav" v-if="fakeSelectorsRef.settings.pageSwitchingArea==='image'">
                        <div
                                class="main_contentList_imgContainer_handleNav__previous"
                                :class="{'main_contentList_imgContainer_handleNav__previous-disActive'
                                    :(baseInfo.pageActualRef.value===0 && baseInfo.previousChapterRef.value.chapter===undefined)
                                    ||(fakeSelectorsRef.settings.readingMode==='entirely' && baseInfo.previousChapterRef.value.chapter===undefined)}"
                                @click="handlePrevious()">
                        </div>
                        <div
                                class="main_contentList_imgContainer_handleNav__next"
                                :class="{'main_contentList_imgContainer_handleNav__next-disActive'
                                    :(baseInfo.pageActualRef.value===chapter.images.length-1 && baseInfo.nextChapterRef.value.chapter===undefined)
                                    ||(fakeSelectorsRef.settings.readingMode==='entirely' && baseInfo.nextChapterRef.value.chapter===undefined)}"
                                @click="handleNext()"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="handleNav" v-if="fakeSelectorsRef.settings.pageSwitchingArea==='fullScreen'">
            <div
                    class="handleNav__previous"
                    :class="{'handleNav__previous-disActive'
                        :(baseInfo.pageActualRef.value===0 && baseInfo.previousChapterRef.value.chapter===undefined)
                        ||(fakeSelectorsRef.settings.readingMode==='entirely' && baseInfo.previousChapterRef.value.chapter===undefined)}"
                    @click="handlePrevious()">
            </div>
            <div
                    class="handleNav__next"
                    :class="{'handleNav__next-disActive'
                        :(baseInfo.pageActualRef.value===chapter.images.length-1 && baseInfo.nextChapterRef.value.chapter===undefined)
                        ||(fakeSelectorsRef.settings.readingMode==='entirely' && baseInfo.nextChapterRef.value.chapter===undefined)}"
                    @click="handleNext()"
            ></div>
        </div>
        <div
                class="overwrite"
                v-if="chaptersOpen===true || settingsOpen===true || fakeSelectorsRef.choicePage.isOpen===true"
                @click="closeSlides()"
        ></div>
    </div>
</template>

<style lang="scss" scoped>
    .wrapForContent{
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        background-color: #2b2b2c;
    }
    // z-index: 2; start
    .header{
        z-index: 2;
        background-color: #313336;
        height: 50px;
        display: flex;
        justify-content: center;
        position: sticky;
        top: 0;
        transition: all .3s ease-in-out;
        &-transparent{
            opacity: 0;
            transition: all .3s ease-in-out;
        }
        &_left{
            position: absolute;
            left: 0;
            height: 100%;
            &_toComics{
                background-color: inherit;
                font: inherit;
                cursor: pointer;
                border: none;
                border-radius: 0;
                //----
                height: 100%;
                padding: 0 12px;
                transition: all .3s ease-in-out;
                &:hover{
                    background-color: #3c3f41;
                    transition: all .3s ease-in-out;
                }
                &__orName,&__ruName{
                    color: aliceblue;
                    text-align: left;
                }
                &__orName{
                    font-family: "Roboto Light", sans-serif;
                    font-size: .8rem;
                    line-height: .8rem;
                }
                &__ruName{
                    font-size: 1rem;
                    margin-top: 4px;
                }
            }
        }
        &_center{
            position: absolute;
            display: flex;
            height: 100%;
            &_previousChapter,&_chaptersNav,&_nextChapter{
                background-color: inherit;
                font: inherit;
                cursor: pointer;
                border: none;
                padding: inherit;
                border-radius: 0;
                //----
                height: 100%;
                transition: all .3s ease-in-out;
                &:hover{
                    background-color: #3c3f41;
                    transition: all .3s ease-in-out;
                }
            }
            &_previousChapter,&_nextChapter{
                padding: 0;
                //----
                display: flex;
                justify-content: center;
                align-items: center;
                //----
                aspect-ratio: 1;
                &>svg{
                    fill: aliceblue;
                    height: 1.2rem;
                }
                &:disabled{
                    &:hover{
                        background-color: inherit;
                    }
                    &>svg{
                        fill: #3c3f41;
                    }
                }
            }
            &_previousChapter{
                &>svg{}
            }
            &_chaptersNav{
                padding: 0 12px;
                &__header{
                    font-family: "Roboto Light", sans-serif;
                    font-size: .8rem;
                    line-height: .8rem;;
                }
                &__name{
                    font-size: 1rem;
                    margin-top: 4px;
                }
            }
            &_nextChapter{
                &>svg{
                    transform: rotate(180deg);
                }
            }
        }
        &_right{
            position: absolute;
            right: 0;
            height: 100%;
            &_settings{
                background-color: inherit;
                font: inherit;
                cursor: pointer;
                border: none;
                padding: 0;
                border-radius: 0;
                //----
                display: flex;
                justify-content: center;
                align-items: center;
                //----
                height: 100%;
                aspect-ratio: 1;
                transition: all .3s ease-in-out;
                &>svg{
                    fill: aliceblue;
                    height: 1.2rem;
                    transition: all 1s linear;
                }
                &:hover{
                    background-color: #3c3f41;
                    transition: all .3s ease-in-out;
                    &>svg{
                        transition: all 1000s linear;
                        transform: rotate(270000deg);
                    }
                }
            }
        }
    }
    .choicePage{
        z-index: 2;
        position: fixed;
        bottom: 0;
        margin: 20px;
        &>button{
            &:hover{
                background-color: #3c3f41;
            }
        }
        &>div{
            background-color: #3c3f41;
            //----
            max-height: 71vh;
            overflow: auto;
            border: none;
            &>button{
                background-color: #3c3f41;
                transition: none;
                &:hover{
                    background-color: #2b2b2c;
                    transition: none;
                }
            }
        }
        &[isOpen=true]{
            &>button{
                background-color: #3c3f41;
            }
        }
    }
    .chaptersBlock,.settingsBlock{
        z-index: 2;
        position: fixed;
        overflow: auto;
        background-color: #3c3f41;
        height: 100vh;
        width: 500px;
        right: -500px;
        transition: all .25s ease-in-out;
        &[isOpen=true]{
            right: 0;
            transition: all .25s ease-in-out;
        }
        &_header{
            position: sticky;
            top: 0;
            background-color: #3c3f41;
            height: 50px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            &__name{
                padding: 0 12px;
                font-size: 2rem;
            }
            &_close{
                background-color: inherit;
                font: inherit;
                cursor: pointer;
                border: none;
                padding: 0;
                border-radius: 0;
                //----
                display: flex;
                justify-content: center;
                align-items: center;
                //----
                height: 100%;
                aspect-ratio: 1;
                transition: all .3s ease-in-out;
                &:hover{
                    background-color: #2b2b2c;
                    transition: all .3s ease-in-out;
                }
                &>svg{
                    fill: aliceblue;
                    height: 1.2rem;
                }
            }
            &_content{}
        }
    }
    .settingsBlock{
        &_header{
            &__name{}
            &_close{
                &>svg{}
            }
        }
        &_content{
            padding: 20px 12px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            &_readingMode,&_containerWidth,&_reducingLargePictures,&_increasingSmallPictures,&_pageSwitchingArea,&_flippingBack{
                display: flex;
                flex-direction: column;
                gap: 10px;
                &__title{
                    &>span{
                        font-family: Roboto Light, sans-serif;
                    }
                }
                &_buttonsBlock{
                    &__button{}
                }
                &__slider{
                    padding: 0;
                    border: none;
                    //----
                    -webkit-appearance: none;
                    appearance: none;
                    outline: none;
                    //----
                    background-color: aliceblue;
                    height: 3px;
                    border-bottom: 1px solid aliceblue;
                    border-radius: 4px;
                    margin: 19.5px 0;
                    &:hover{}
                    &::-webkit-slider-thumb{
                        -webkit-appearance: none;
                        appearance: none;
                        border: none;
                        //----
                        background-color: aliceblue;
                        width: 24px;
                        height: 24px;
                        border-radius: 12px;
                        cursor: pointer;
                        transition: all .1s ease-in-out;
                        &:hover{
                            transition: all .1s ease-in-out;
                            background-color: #313336;
                        }
                        &:active{
                            transition: all .1s ease-in-out;
                            background-color: #2b2b2c;
                        }
                    }
                    &::-moz-range-thumb{
                        border: none;
                        //----
                        background: aliceblue;
                        width: 24px;
                        height: 24px;
                        border-radius: 12px;
                        cursor: pointer;
                        transition: all .1s ease-in-out;
                        &:hover{
                            transition: all .1s ease-in-out;
                            background: #313336;
                        }
                        &:active{
                            transition: all .1s ease-in-out;
                            background: #2b2b2c;
                        }
                    }
                }
            }
            &_readingMode{}
            &_reducingLargePictures{}
            &_containerWidth{}
            &_increasingSmallPictures{}
            &_pageSwitchingArea{}
            &_flippingBack{}
        }
    }
    .chaptersBlock{
        &_header{
            &__name{}
            &_close{
                &>svg{}
            }
        }
        &_content{
            display: flex;
            flex-direction: column-reverse;
            &_volume{
                display: flex;
                flex-direction: column-reverse;
                &__chapter{
                    cursor: pointer;
                    width: auto;
                    padding: 8px 12px;
                    font-size: 1rem;
                    &:hover{
                        background-color: #2b2b2c;
                    }
                }
            }
        }
    }
    // z-index: 2; end
    .main{
        &_contentList{
            margin: 0 auto;
            width: 1080px;
            max-width: calc(100vw - 15px);
            display: flex;
            flex-direction: column;
            align-items: center;
            &_imgContainer{
                display: flex;
                position: relative;
                &__img{
                    max-width: calc(100vw - 15px);
                }
                &-reduce{
                    max-width: 100%;
                    &>img{
                        max-width: 100%;
                    }
                }
                &-increase{
                    min-width: 100%;
                    &>img{
                        min-width: 100%;
                    }
                }
                &_handleNav{
                    position: absolute;
                    display: flex;
                    height: 100%;
                    width: 100%;
                    &__previous,&__next{
                        width: 50%;
                        height: 100%;
                        cursor: pointer;
                        &-disActive{
                            cursor: default;
                        }
                    }
                    &__previous{
                        &-disActive{}
                    }
                    &__next{
                        &-disActive{}
                    }

                    // on .handleNav,.main_contentList_imgContainer_handleNav
                    &__previous,&__next{
                        &-disActive{}
                    }
                    &__previous{
                        &-disActive{}
                    }
                    &__next{
                        &-disActive{}
                    }
                }
            }
        }
    }
    .handleNav{
        position: fixed;
        display: flex;
        height: 100vh;
        width: 100vw;
        &__previous,&__next{
            width: 50%;
            height: 100%;
            cursor: pointer;
            &-disActive{
                cursor: default;
            }
        }
        &__previous{
            &-disActive{}
        }
        &__next{
            &-disActive{}
        }
    }
    .overwrite{
        position: fixed;
        width: 100vw;
        height: 100vh;
    }
    @media screen and (max-width: 767px){
        .chaptersBlock,.settingsBlock{
            width: 100%;
            right: -100%;
        }
    }
</style>