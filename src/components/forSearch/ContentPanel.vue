<script setup="">
    // core
    import {ref} from 'vue'

    //pinia
    import {useComicsSearchStore} from '../../stores/comicsSearch'
    const {fastStartedFuncs}=useComicsSearchStore()
    // reactive pinia
    import {storeToRefs} from 'pinia'
    const {getComicsList,filterOpenForMobile}=storeToRefs(useComicsSearchStore())
    // fast func from pinia
    fastStartedFuncs()

    // router
    import router from "../../routes";

    // cards in row
    const cardsInRow=5

    // fakeElements
    let fakeElementsRef=ref({})

    // sortSelectArrayRef
    const sortSelectArrayRef=ref([
        {
            name: 'rating',
            callingRuName:'По рейтингу',
        },
        {
            name: 'scoreSum',
            callingRuName:'По количеству оценок',
        },
        {
            name: 'viewsSum',
            callingRuName:'По количеству просмотров',
        },
        {
            name: 'chaptersSum',
            callingRuName:'По количеству глав',
        },

    ])
    fakeElementsRef.value['selectedSort']=sortSelectArrayRef.value[0].name
    // console.log(sortSelectArrayRef.value[0].name)
    // console.log(fakeElementsRef.value['selectedSort'])

    // goToComicsInfo
    const goToComicsInfo=(id)=>{
        router.push({name:'comics',params:{id:id}})
    }
    const goToComicsInfoInNewTab=(id)=>{
        let routeData=router.resolve({name:'comics',params:{id:id}});
        window.open(routeData.href,'_blank');
    }
</script>

<template>
    <div class="wrapForContentPanel">
        <div class="control">
            <div class="control_nav">
                <div class="control_nav_leftSide">
                    <h2 class="control_nav_leftSide__title">Каталог</h2>
                </div>
                <div class="control_nav_rightSide">
                    <div class=" control_nav_rightSide__fakeSelect fakeSelect" :isOpen="fakeElementsRef['sortComicsIsOpen']===true">
                        <button
                                type="button"
                                @click="[fakeElementsRef['sortComicsIsOpen']=!fakeElementsRef['sortComicsIsOpen']]"
                        >
                            {{fakeElementsRef['selectedSort']===undefined?'выбери меня':
                            sortSelectArrayRef.find(val=>(val.name===fakeElementsRef['selectedSort'])).callingRuName}}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                                <path d="M329.6 24c-18.4-32-64.7-32-83.2 0L6.5 440c-18.4 31.9 4.6 72 41.6 72H528c36.9 0 60-40 41.6-72l-240-416z"/></svg>
                        </button>
                        <transition name="demoTransition">
                            <div v-if="fakeElementsRef['sortComicsIsOpen']">
                                <button
                                        type="button"
                                        v-for="(variationItem,variationIndex) in sortSelectArrayRef"
                                        @click="[fakeElementsRef['selectedSort']=variationItem.name,fakeElementsRef['sortComicsIsOpen']=undefined]"
                                >{{variationItem.callingRuName}}</button>
                            </div>
                        </transition>
                    </div>
                    <button class="control_nav_rightSide__openfilters" @click="filterOpenForMobile=!filterOpenForMobile">Фильтры</button>
                </div>
            </div>
            <div class="control_search">
                <input
                        class="control_search__searchInput"
                        type="text"
                        placeholder="Поиск по названию"
                        v-model="fakeElementsRef['searchingInRuName']"
                >
            </div>
        </div>
        <div class="content">
            <div
                    class="content_comicsCard pointer"
                    v-for="comics in (fakeElementsRef['searchingInRuName']===undefined?
                    getComicsList.sort((k,l)=>(l[fakeElementsRef['selectedSort']]-k[fakeElementsRef['selectedSort']])):
                    getComicsList.sort((k,l)=>(l[fakeElementsRef['selectedSort']]-k[fakeElementsRef['selectedSort']]))
                    .filter(val=>(val.ruName.toLowerCase().includes(fakeElementsRef['searchingInRuName'].toLowerCase()))))"
                    @click="goToComicsInfo(comics.id)"
                    @click.middle="goToComicsInfoInNewTab(comics.id)"
            >
                <img class="content_comicsCard__image" :src="comics.img" alt="">
                <div class="content_comicsCard__shadow"></div>
                <p class="content_comicsCard__name">{{comics.ruName}}</p>
            </div>
            <div class="content_fakeComicsCard" v-for="i in cardsInRow-(
                fakeElementsRef['searchingInRuName']===undefined?
                getComicsList:
                getComicsList.filter(val=>(val.ruName.toLowerCase().includes(fakeElementsRef['searchingInRuName'].toLowerCase())))
            ).length%cardsInRow"></div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    $cardsInRow: 5;
    .wrapForContentPanel{
        display: flex;
        flex-direction: column;
        padding: 10px;
        gap: 10px;
    }
    .control{
        display: flex;
        flex-direction: column;
        gap: 10px;
        &_nav{
            display: flex;
            justify-content: space-between;
            align-items: center;
            &_leftSide{
                &__title{
                    line-height: 2rem;
                }
            }
            &_rightSide{
                &__fakeSelect{
                    z-index: 1;
                    &>button{
                        background-color: #2b2b2c;
                        border-radius: 5px;
                        &>svg{}
                        &:hover{
                            background-color: #313336;
                            transition: all .3s ease-in-out;
                        }
                    }
                    &>div{
                        right: 0;
                        border-radius: 5px;
                        margin: 8px 0;
                        &>button{
                            background-color: #3c3f41;
                            &:hover{
                                background-color: #2b2b2c;
                            }
                        }
                    }
                }
                &__openfilters{
                    display: none;
                }
            }
        }
        &_search{
            &__searchInput{
                width: 100%;
                border-radius: 5px;
            }
        }
    }
    .content{
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        &_comicsCard,&_fakeComicsCard{
            width: calc(100% / ($cardsInRow + 1) + 1%);
            flex-grow: 1;
            aspect-ratio:210/297;
        }
        &_comicsCard{
            border-radius: 5px;
            overflow: hidden;
            position: relative;
            &__image{
                object-fit: cover;
                width: 100%;
                height: 100%;
            }
            &__shadow{
                position: absolute;
                bottom: 0;
                width: 200%;
                height: 100%;
                box-shadow: inset 0 -50px 50px #2b2b2c;
            }
            &__name{
                position: absolute;
                bottom: 0;
                padding: 8px;
                font-family: Roboto Light, sans-serif;
            }
        }
        &_fakeComicsCard{}
    }
    @media screen and (max-width: 991px){
        $cardsInRow: 4;
        .content{
            &_comicsCard,&_fakeComicsCard{
                width: calc(100% / ($cardsInRow + 1) + 1%);
            }
        }
        .control_nav_rightSide{
            display: flex;
            gap: 10px;
            &__openfilters{
                display: block;
                background-color: #2b2b2c;
                /*border: none;*/
                border-radius: 5px;
                padding: 6px 12px;
                :hover{
                    background-color: #313336;
                }
            }
        }
    }
    @media screen and (max-width: 767px){
        $cardsInRow: 3;
        .content{
            &_comicsCard,&_fakeComicsCard{
                width: calc(100% / ($cardsInRow + 1) + 1%);
            }
        }
    }
</style>