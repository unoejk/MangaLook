<script setup="">
    // core
    import {ref} from 'vue'

    // _global
    import {toCapitalizeFirst,deepClone,numToDashString} from '../stores/_global'

    // components
    import MainPageWrapper from '../components/_MainPageWrapper/MainPageWrapper.vue'

    // axios
    import {axGet,axPost,axPatch,axRefreshId} from '../stores/_axios.js'

    // router
    import {useRouter, useRoute} from 'vue-router'
    const router=useRouter()
    const route=useRoute()

    //pinia
    import {useRegisterStore} from '../stores/register'
    // const {}=useRegisterStore()
    // reactive pinia
    import {storeToRefs} from 'pinia'
    const {getLoggedInfo}=storeToRefs(useRegisterStore())

    // load comics and comicsInfo
    let comics=ref(undefined)
    let comicsInfo=ref(undefined)
    ;(async ()=>{
        comics.value=await axGet('comics/'+Number(route.params.id))
        comicsInfo.value=await axGet('comicsInfo/')
    })()

    // goToComicsView()
    const goToComicsView=(volume,chapter)=>{
        if (comics.value.contentIdList[0][0]===undefined){
            mistakesArray.value.push(`Комикс пустой: глав ещё не добавили`)
            mistakesListOpen.value=true
            return
        }
        if (!volume){
            volume=0
        }
        if (!chapter){
            chapter=comics.value.contentIdList[0][0].chapterNum
        }
        axPatch('comics/'+comics.value.id,{viewsSum:(comics.value.viewsSum+1)})
        router.push({name:'content',params:{
            id:route.params.id,
            volume:volume+1,
            chapter:numToDashString(chapter)
        }})
    }

    // addChapters
    let volumeNum=ref()                 // номер вкладки выбранного тома
    let defaultChapterNum=ref()         // номер новой главы по умолчанию
    const setDefaultChapterNum=()=>{
        // активируется когда выбираем вкладку с томом и считает номер новой главы по умолчанию
        if (comics.value.contentIdList[volumeNum.value][0]===undefined){
            // если том пустой, глава будет 1
            defaultChapterNum.value=1
        }else {
            // для понятливости кода, выделяем массив тома в отдельную переменную
            const actualVolume=comics.value.contentIdList[volumeNum.value]
            // номер последней главы округляем в меньшую сторону (на случай если это 47.5, например),
            // делаем +1 и записываем в по умолчанию
            defaultChapterNum.value=Math.floor(actualVolume[actualVolume.length-1].chapterNum)+1
        }
    }
    const chapterForComicsDefault={     // то что запишем в comics (информация о главе)
        chapterNum:undefined,
        ruName:undefined,
        neededId:undefined              // равен id из chapterForContent (по нему мы будем искать картинки в content)
    }
    let chapterForComics=ref(deepClone(chapterForComicsDefault))
    const chapterForContentDefault={    // то что запишем в content (картинки)
        id: undefined,
        images:[[]]                     // [ страницы в виде массива, [картинки в виде строки] ]
    }
    let chapterForContent=ref(deepClone(chapterForContentDefault))
    const addChapters=async ()=>{
        // если номер главы не указан, ставим по умолчанию
        if (chapterForComics.value.chapterNum===undefined || chapterForComics.value.chapterNum===''){
            chapterForComics.value.chapterNum=defaultChapterNum.value
        }
        // если название главы не указано, удаляем строку
        if (chapterForComics.value.chapterNum===undefined || chapterForComics.value.ruName===''){
            delete chapterForComics.value.ruName
        }
        // проверка на пустые сыылки и страницы, + их очистка
        const chapterClone=deepClone(chapterForContent.value.images)
        const pagesSum=chapterClone.length
        for (let pageNum in chapterClone){
            const reversePageNum=pagesSum-pageNum-1
            const pageClone=deepClone(chapterForContent.value.images[reversePageNum])
            const imgSum=pageClone.length
            // удаляем пустые картинки
            for (let imgNum in pageClone){
                const reverseImgNum=imgSum-imgNum-1
                if (chapterForContent.value.images[reversePageNum][reverseImgNum]==='' || chapterForContent.value.images[reversePageNum][reverseImgNum]===null){
                    await chapterForContent.value.images[reversePageNum].splice(reverseImgNum,1)
                }
            }
            // удаляем пустые страницы
            if (chapterForContent.value.images[reversePageNum][0]===undefined){
                await chapterForContent.value.images.splice(reversePageNum,1)
            }
        }
        // если всё оказалось пусто добавляем ошибку
        if (chapterForContent.value.images[0]===undefined){
            mistakesArray.value.push(`Нужна хоть одна картинка`)
        }
        // Проверяем чтобы главы с указанным номером небыло в этом томе
        for (let chapterNum in comics.value.contentIdList[volumeNum.value]){
            if (chapterForComics.value.chapterNum===comics.value.contentIdList[volumeNum.value][chapterNum].chapterNum){
                mistakesArray.value.push(`Глава ${chapterForComics.value.chapterNum} уже есть в этом томе`)
            }
        }
        // смотрим наличие ошибок, если есть, выходим
        if (mistakesArray.value[0]!==undefined){
            mistakesListOpen.value=true
            return
        }
        // делаем id для главы и патчим lastId в content/0 из data.json
        chapterForComics.value.neededId=chapterForContent.value.id=await axRefreshId('content/0')
        // обновляем загруженный comics, чтобы пропатчить им comics из data.json
        comics.value.chaptersSum++
        comics.value.contentIdList[volumeNum.value].push(chapterForComics.value)
        // сортируем текущий том, на случай если добавляемая глава - не последняя
        comics.value.contentIdList[volumeNum.value].sort((k,l)=>(k.chapterNum-l.chapterNum))
        // добавляем главу в content из data.json
        await axPost('content',chapterForContent.value)
        // патчим comics из data.json
        await axPatch('comics/'+comics.value.id,{
            chaptersSum:comics.value.chaptersSum,
            contentIdList:comics.value.contentIdList
        })
        doneMessage.value=`Глава ${chapterForComics.value.chapterNum} добавлена в Том ${volumeNum.value+1}`
        doneMessageListOpen.value=true
    }

    // overwrite messages
    let mistakesListOpen=ref(false)
    let doneMessageListOpen=ref(false)
    let mistakesArray=ref([])
    let doneMessage=ref(undefined)
    const closeMistakesMessage=()=>{
        mistakesListOpen.value=false
        mistakesArray.value=[]
    }
    const closeDoneMessage=()=>{
        chapterForComics.value=deepClone(chapterForComicsDefault)
        chapterForContent.value=deepClone(chapterForContentDefault)
        setDefaultChapterNum()
        doneMessageListOpen.value=false
        doneMessage.value=undefined
    }

    // rightSidePage
    let rightSidePage=ref('infoBlock')

    // score
    let scoresOpen=ref(false)
    const setScore=async (newScore)=>{
        // comics
        let newRating=0
        let oldRating=comics.value.rating
        let scoreSum=comics.value.scoreSum
        let scoreDetail=await comics.value.scoreDetail
        // user
        let userScores=getLoggedInfo.value.loggedUser.scores
        let previousUserScore=userScores.find(val=>(val.comicsId===comics.value.id))
        let previousUserScoreIndex=userScores.findIndex(val=>(val.comicsId===comics.value.id))
        // patch comics
        if (oldRating===0){
            newRating=newScore
            scoreSum++
            scoreDetail[newScore.toString()]++
        }else {
            if (previousUserScore===undefined){
                scoreSum++
            }else {
                scoreDetail[previousUserScore.score.toString()]--
            }
            scoreDetail[newScore.toString()]++
            for (let score in scoreDetail){
                newRating=newRating+parseInt(score)*scoreDetail[score]/scoreSum
            }
        }
        await axPatch('comics/'+comics.value.id,{
            rating:newRating,
            scoreSum:scoreSum,
            scoreDetail:scoreDetail,
        })
        comics.value.rating=newRating
        comics.value.scoreSum=scoreSum
        comics.value.scoreDetail=scoreDetail
        // patch user
        if (previousUserScore===undefined){
            userScores.push({
                comicsId:comics.value.id,
                score:newScore
            })
        }else {
            userScores[previousUserScoreIndex].score=newScore
        }
        await axPatch('users/'+getLoggedInfo.value.loggedUser.id,{
            scores:userScores,
        })
    }

    // createManyPages()
    const createManyPages=()=>{
        for (let i=0; i!==99; i++) {
            chapterForContent.value.images.push([])
        }
    }
</script>

<template>
    <MainPageWrapper>
        <div class="wrapForComics" v-if="comics!==undefined && comicsInfo!==undefined">
            <div class="leftSide">
                <div class="leftSide_imgBlock">
                    <div class="leftSide_imgBlock_imgWrap">
                        <img :src="comics.img" alt="" class="leftSide_imgBlock_imgWrap__img">
                    </div>
                    <div class="leftSide_imgBlock_titleBlockForMobile">
                        <h2 class="leftSide_imgBlock_titleBlockForMobile__orName">{{comics.orName}}</h2>
                        <h1 class="leftSide_imgBlock_titleBlockForMobile__ruName">{{comics.ruName}}</h1>
                        <h2 class="leftSide_imgBlock_titleBlockForMobile__rating"> {{'Рейтинг: '+comics.rating+' / 10'}}</h2>
                    </div>
                </div>
                <button class="leftSide__goToComicsView" @click="goToComicsView()">Читать</button>
                <ul class="leftSide_baseInfoList">
                    <li
                            class="leftSide_baseInfoList_filter"
                            v-for="filterName in ['type','releaseFormat','titleStatus','transferStatus','chaptersSum','ageRating']
                            .filter(val=>(Array.isArray(comics[val])?comics[val][0]!==undefined:comics[val]!==undefined))"
                    >
                        <span class="leftSide_baseInfoList_filter__title">
                                {{toCapitalizeFirst(comicsInfo.find(val=>(val.name===filterName)).ruName)}}
                        </span>
                        <div class="leftSide_baseInfoList_filter_variations" v-if="typeof comics[filterName]==='string'">
                            <span class="leftSide_baseInfoList_filter_variations__item">
                                {{toCapitalizeFirst(comicsInfo.find(val=>(val.name===filterName)).items.find(val=>(val.name===comics[filterName])).ruName)}}
                            </span>
                        </div>
                        <div class="leftSide_baseInfoList_filter_variations" v-else-if="typeof comics[filterName]==='number'">
                            <span class="leftSide_baseInfoList_filter_variations__item">
                                {{comics[filterName]}}
                            </span>
                        </div>
                        <div class="leftSide_baseInfoList_filter_variations" v-else-if="Array.isArray(comics[filterName])">
                            <span class="leftSide_baseInfoList_filter_variations__item" v-for="variationItem in comics[filterName]">
                                {{toCapitalizeFirst(comicsInfo.find(val=>(val.name===filterName)).items.find(val=>(val.name===variationItem)).ruName)}}
                            </span>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="rightSide">
                <div class="rightSide_header">
                    <div class="rightSide_header_left">
                        <h2 class="rightSide_header_left__orName">{{comics.orName}}</h2>
                        <h1 class="rightSide_header_left__ruName">{{comics.ruName}}</h1>
                    </div>
                    <button class="rightSide_header_right" @click="scoresOpen=!scoresOpen" :disabled="!getLoggedInfo.isLogged" :canOpen="getLoggedInfo.isLogged">
                        <h2 class="rightSide_header_right__text">Рейтинг</h2>
                        <h1 class="rightSide_header_right__rating">{{comics.rating.toFixed(2)+' / 10'}}</h1>
                    </button>
                </div>
                <div class="rightSide_score" v-if="scoresOpen">
                    <button class="rightSide_score__button" v-for="score in 10" @click="[setScore(score),scoresOpen=false]">
                        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512">
                            <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>
                    </button>
                </div>
                <div class="rightSide_main">
                    <div class="rightSide_main_nav fakeRadioButtonsBlock">
                        <button
                                class="rightSide_main_nav__button"
                                :isChoiced="rightSidePage==='infoBlock'"
                                @click="rightSidePage='infoBlock'"
                        >Информация</button>
                        <button
                                class="rightSide_main_nav__button"
                                :isChoiced="rightSidePage==='chaptersBlock'"
                                @click="rightSidePage='chaptersBlock'"
                        >Главы</button>
                        <button
                                class="rightSide_main_nav__button"
                                :isChoiced="rightSidePage==='addContent'"
                                @click="rightSidePage='addContent'"
                        >Добавить контент</button>
                    </div>
                    <div class="rightSide_main_view">
                        <div class="infoBlock" v-if="rightSidePage==='infoBlock'">
                            <div class="infoBlock_description">
                                <h2 class="infoBlock_description__header">Описание</h2>
                                <p class="infoBlock_description__text">{{comics.description}}</p>
                            </div>
                            <div class="infoBlock_genres">
                                <h2 class="infoBlock_genres__header">Жанры</h2>
                                <ul class="infoBlock_genres_list">
                                    <li class="infoBlock_genres_list__item" v-for="genre in comics.genres">
                                        {{comicsInfo.find(val=>(val.name==='genres')).items.find(val=>(val.name===genre)).ruName}}
                                    </li>
                                </ul>
                            </div>
                            <div class="infoBlock_tags">
                                <h2 class="infoBlock_tags__header">Теги</h2>
                                <ul class="infoBlock_tags_list">
                                    <li class="infoBlock_tags_list__item" v-for="tag in comics.tags">
                                        {{comicsInfo.find(val=>(val.name==='tags')).items.find(val=>(val.name===tag)).ruName}}
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="chaptersBlock" v-if="rightSidePage==='chaptersBlock'">
                            <div class="chaptersBlock_content">
                                <ul v-for="(volumeItem,volumeIndex) in comics.contentIdList" class="chaptersBlock_content_volume">
                                    <li
                                            v-for="(chapterItem,chapterIndex) in comics.contentIdList[volumeIndex]"
                                            class="chaptersBlock_content_volume__chapter"
                                            @click="goToComicsView(volumeIndex,chapterItem.chapterNum)"
                                    >
                                        {{'Том '+(volumeIndex+1)+' Глава '+chapterItem.chapterNum}}
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="addContent" v-if="rightSidePage==='addContent'">
                            <div class="addContent_volumeBlock">
                                <h2 class="addContent_volumeBlock__title">Выбор тома</h2>
                                <div class="addContent_volumeBlock_nav fakeRadioButtonsBlock">
                                    <button
                                            class="addContent_volumeBlock_nav__button"
                                            :isChoiced="volumeNum===volumeIndex"
                                            v-for="(volumeItem,volumeIndex) in comics.contentIdList"
                                            @click="[volumeNum=volumeIndex,setDefaultChapterNum()]"
                                    >Том {{volumeIndex+1}}</button>
                                    <button
                                            class="addContent_volumeBlock_nav__button"
                                            @click="[comics.contentIdList.push([]),volumeNum=comics.contentIdList.length-1,setDefaultChapterNum()]"
                                    >Добавить Том {{comics.contentIdList.length+1}}</button>
                                </div>
                            </div>
                            <form class="addContent_addForm" @submit.prevent="addChapters" v-if="volumeNum!==undefined">
                                <div class="addContent_addForm_baseInfo">
                                    <h2 class="addContent_addForm_baseInfo__title">Информация о главе</h2>
                                    <input
                                            class="addContent_addForm_baseInfo__input"
                                            type="number" min="0" step=".1" v-model="chapterForComics.chapterNum"
                                            :placeholder="'Номер главы (по умолчанию: '+defaultChapterNum+')'"
                                    >
                                    <input
                                            class="addContent_addForm_baseInfo__input"
                                            type="text" v-model="chapterForComics.ruName"
                                            :placeholder="'Название главы (необязательно)'"
                                    >
                                </div>
                                <div class="addContent_addForm_newPage" v-for="(pageItem,pageIndex) in chapterForContent.images">
                                    <h2 class="addContent_addForm_newPage__title">Страница {{pageIndex+1}}</h2>
                                    <input
                                            class="addContent_addForm_newPage__input"
                                            type="text" v-model="chapterForContent.images[pageIndex][0]"
                                            :placeholder="'Ссылка на картинку '+(pageIndex+1)+'.1'"
                                    >
                                    <input
                                            class="addContent_addForm_newPage__input"
                                            v-for="(imageItem,imageIndex) in pageItem"
                                            type="text" v-model="chapterForContent.images[pageIndex][imageIndex+1]"
                                            :placeholder="'Ссылка на картинку '+(pageIndex+1)+'.'+(imageIndex+2)"
                                    >
                                </div>
                                <div class="addContent_addForm_controlButtons">
                                    <button
                                            class="addContent_addForm_controlButtons__btn"
                                            type="button" @click="chapterForContent.images.push([])"
                                            v-on:click.shift="createManyPages()"
                                    >Добавить страницу</button>
                                    <button
                                            class="addContent_addForm_controlButtons__btn"
                                            type="submit"
                                    >Готово: загружаем главу</button>
                                </div>
                                <div class="addContent_addForm_description">
                                    <p class="addContent_addForm_description__text">"shift"+"click" на "Добавить страницу" - добавит 100 страниц</p>
                                    <p class="addContent_addForm_description__text">(пустые сраницы и картинки удаляются сами)</p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <transition name="demoTransition">
            <div class="mistakesList" v-if="mistakesListOpen">
                <p v-for="(mistakesItem,mistakesIndex) in mistakesArray">{{mistakesItem}}</p>
                <button type="button" @click="closeMistakesMessage()">Понятно</button>
            </div>
        </transition>
        <transition name="demoTransition">
            <div class="doneMessage" v-if="doneMessageListOpen">
                <p>{{doneMessage}}</p>
                <button type="button" @click="closeDoneMessage()">Понятно</button>
            </div>
        </transition>
    </MainPageWrapper>
</template>

<style lang="scss" scoped>
    .wrapForComics{
        display: flex;
    }
    .leftSide{
        width: calc(29% - 30px);
        margin: 20px 10px 20px 20px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        &_imgBlock{
            &_imgWrap{
                width: 100%;
                aspect-ratio:210/297;
                border-radius: 15px;
                overflow: hidden;
                &__img{
                    object-fit: cover;
                    width: 100%;
                    height: 100%;
                }
            }
            &_titleBlockForMobile{
                display: none;
            }
        }
        &__goToComicsView{
            width: 100%;
            font-family: Roboto Bold, sans-serif;
            background-color: #3c3f41;
            color: orange;
            border-color: #3c3f41;
            &:hover{
                border-color: orange;
            }
            &:active{
                background-color: #2b2b2c;
            }
        }
        &_baseInfoList{
            background-color: #3c3f41;
            border-radius: 15px;
            overflow: hidden;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            &_filter{
                &__title{
                    font-family: "Roboto Light", sans-serif;
                    font-size: .8rem;
                    line-height: .8rem;
                }
                &_variations{
                    display: flex;
                    flex-wrap: wrap;
                    margin-top: .25rem;
                    &__item{
                        white-space: nowrap;
                        font-size: 1rem;
                        &:after{
                            content: ',';
                            margin-right: .5rem;
                        }
                        &:last-child:after{
                            content: none;
                        }
                    }
                }
            }
        }
    }
    .rightSide{
        margin: 20px 20px 20px 10px;
        width: calc(71% - 30px);
        display: flex;
        flex-direction: column;
        gap: 20px;
        &_header{
            display: flex;
            justify-content: space-between;
            &_left{
                &__orName{
                    font-family: "Roboto Light", sans-serif;
                    margin-bottom: 4px;
                }
                &_ruName{}
            }
            &_right{
                background-color: initial;
                padding: 0;
                border: none;
                border-radius: initial;
                cursor: inherit;
                &[canOpen=true]{
                    cursor: pointer;
                    &>h1,h2,p{
                        transition: all .1s ease-in-out;
                    }
                    &:hover{
                        &>h1,h2,p{
                            transition: all .1s ease-in-out;
                            color: orange;
                        }
                    }
                }
                //----
                text-align: right;
                &__text{
                    font-family: "Roboto Light", sans-serif;
                    margin-bottom: 4px;
                }
                &__rating{
                    white-space: nowrap;
                }
            }
        }
        &_score{
            display: flex;
            justify-content: right;
            &__button{
                background-color: initial;
                padding: 0 5px;
                border: none;
                border-radius: initial;
                &>svg{
                    fill: aliceblue;
                    height: 1.5rem;
                    transition: all .1s ease-in-out;
                }
                &:hover,&:has(~button:hover){
                    &>svg{
                        transition: all .1s ease-in-out;
                        fill: orange;
                    }
                }
            }
        }
        &_main{
            background-color: #3c3f41;
            border-radius: 15px;
            overflow: hidden;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            &_nav{
                &__button{}
            }
            &_view{}
        }
    }
    .infoBlock,.chaptersBlock,.addContent{}
    .infoBlock{
        display: flex;
        flex-direction: column;
        gap: 20px;
        &_description,&_genres,&_tags{
            &__header{
                margin-bottom: 8px;
            }
            &__text{}
            &_list{
                display: flex;
                flex-wrap: wrap;
                gap: 4px;

                &__item{
                    display: block;
                    background-color: #2b2b2c;
                    padding: .5rem .75rem;
                    border-radius: 1rem;
                    /*margin: 3px;*/
                }
            }
        }
    }
    .chaptersBlock{
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
                    border-radius: 15px;
                    &:hover{
                        background-color: #2b2b2c;
                    }
                }
            }
        }
    }
    .addContent{
        display: flex;
        flex-direction: column;
        gap: 20px;
        &_volumeBlock{
            display: flex;
            flex-direction: column;
            gap: 10px;
            &__title{}
            &_nav{
                &__button{}
            }
        }
        &_addForm{
            display: flex;
            flex-direction: column;
            gap: 20px;
            &_baseInfo,&_newPage{
                display: flex;
                flex-direction: column;
                gap: 10px;
                &__title{}
                &__input{}
            }
            &_controlButtons{
                display: flex;
                gap: 10px;
                &__btn{
                    flex-grow: 1;
                    margin-bottom: 0;
                }
            }
            &_description{
                &__text{
                    font-family: "Roboto Light";
                }
            }
        }
    }
    @media screen and (max-width: 767px){
        .wrapForComics{
            flex-direction: column;
            padding: 20px;
            gap: 20px;
        }
        .leftSide,.rightSide{
            width: 100%;
            margin: 0;
        }
        .leftSide{
            &__goToComicsView{
                padding: 20px;
            }
            &_imgBlock{
                display: flex;
                gap: 20px;
                &_imgWrap{
                    width: 29%;
                }
                &_titleBlockForMobile{
                    display: block;
                    &__orName{
                        font-family: "Roboto Light", sans-serif;
                    }
                    &__ruName{}
                    &__rating{
                        font-family: "Roboto Light", sans-serif;
                        margin-top: 16px;
                    }
                }
            }
        }
        .rightSide{
            &_header{
                display: none;
            }
            &_main_nav__button{
                padding: 18px;
            }
        }
    }
</style>