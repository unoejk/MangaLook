<script setup="">
    // core
    import {ref} from 'vue'

    //pinia
    import {useComicsSearchStore} from '../../stores/comicsSearch'
    const {filteringComicsList,clearFilters}=useComicsSearchStore()
    // reactive pinia
    import {storeToRefs} from 'pinia'
    const {flLoadedNumerical,flLoadedCommon,flLoadedSeparate,flWritten,flChecked,filterOpenForMobile}=storeToRefs(useComicsSearchStore())

    // fakeElements
    let fakeElementsRef=ref({})

    //  filersForm ()
    const filersForm=async ()=>{}

    // scroll
    let mainFiltersList=ref(document.getElementsByClassName('mainFilters_list__openDescription'))
    const scrollIntoMainFiltersList=()=>{
        setTimeout(()=>{
            mainFiltersList.value[0].scrollIntoView({behavior:"smooth"})
        },1)
    }
</script>

<template>
    <div class="wrapForFiltersPanel">
        <form class="filersForm" @submit.prevent="filersForm">
            <div class="mainFilters">
                <div class="mainFilters_list">
                    <div class="mainFilters_list_openSeparates" v-if="flLoadedSeparate[0]!==undefined">
                        <button
                                v-for="(filterItem,filterIndex) in flLoadedSeparate"
                                class="mainFilters_list_openSeparates__button"
                                type="button"
                                @click="fakeElementsRef[filterItem.name+'IsOpen']=!fakeElementsRef[filterItem.name+'IsOpen']"
                        >
                            <span>{{filterItem.ruName}}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                                <path d="M329.6 24c-18.4-32-64.7-32-83.2 0L6.5 440c-18.4 31.9 4.6 72 41.6 72H528c36.9 0 60-40 41.6-72l-240-416z"/></svg>
                        </button>
                    </div>
                    <div class="mainFilters_list_numericalFilters">
                        <div class="mainFilters_list_numericalFilters_filter" v-for="(filterItem,filterIndex) in flLoadedNumerical">
                            <p class="mainFilters_list_numericalFilters_filter__name">{{filterItem.ruName}}</p>
                            <div class="mainFilters_list_numericalFilters_filter_content">
                                <input
                                        class="mainFilters_list_numericalFilters_filter_content__input"
                                        type="number"
                                        placeholder="min"
                                        v-model="flChecked[filterItem.name].min"
                                >
                                <span class="mainFilters_list_numericalFilters_filter_content__span">—</span>
                                <input
                                        class="mainFilters_list_numericalFilters_filter_content__input"
                                        type="number"
                                        placeholder="max"
                                        v-model="flChecked[filterItem.name].max"
                                >
                            </div>
                        </div>
                    </div>
                    <div class="mainFilters_list_commonFilters">
                        <div class="mainFilters_list_commonFilters_filter" v-for="(filterItem,filterIndex) in flLoadedCommon">
                            <p class="mainFilters_list_commonFilters_filter__name">{{filterItem.ruName}}</p>
                            <div class="mainFilters_list_commonFilters_filter_content">
                                <button
                                        type="button"
                                        class="mainFilters_list_commonFilters_filter_content__fakeCheckbox fakeTripleCheckWithText"
                                        v-for="(variationItem,variationIndex) in filterItem.items.filter(val=>val.dontShow!==true)"
                                        :class="{
                                        'fakeTripleCheckWithText-noMatter':(filterItem.isMultiple && flChecked[filterItem.name][variationItem.name]===undefined),
                                        'fakeTripleCheckWithText-include':(filterItem.isMultiple && flChecked[filterItem.name][variationItem.name]===true),
                                        'fakeTripleCheckWithText-exclude':(filterItem.isMultiple && flChecked[filterItem.name][variationItem.name]===false),
                                        'fakeDoubleCheckWithText-noMatter':(!filterItem.isMultiple && flChecked[filterItem.name][variationItem.name]===undefined),
                                        'fakeDoubleCheckWithText-include':(!filterItem.isMultiple && flChecked[filterItem.name][variationItem.name]===true),}"
                                        @click="filterItem.isMultiple?
                                        (flChecked[filterItem.name][variationItem.name]===undefined?
                                            flChecked[filterItem.name][variationItem.name]=true:
                                            flChecked[filterItem.name][variationItem.name]===true?
                                                flChecked[filterItem.name][variationItem.name]=false:
                                                flChecked[filterItem.name][variationItem.name]=undefined):
                                        (flChecked[filterItem.name][variationItem.name]===undefined?
                                            flChecked[filterItem.name][variationItem.name]=true:
                                            flChecked[filterItem.name][variationItem.name]=undefined)"
                                >
                                    <div></div>
                                    <span class="robotoLight">{{variationItem.ruName}}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="mainFilters_list_description" v-if="fakeElementsRef.isFiltersDescriptionOpen">
                        <div class="mainFilters_list_description_block">
                            <p class="mainFilters_list_description_block__header orange">Оранжевый чекбокс:</p>
                            <p class="mainFilters_list_description_block__text">У фильтров котороые могут быть только в одном варианте на комикс</p>
                            <p class="mainFilters_list_description_block__text">Выбрано несколько оранжевых на 1 фильтр - будет искать совпадения по обоим</p>
                        </div>
                        <div class="mainFilters_list_description_block">
                            <p class="mainFilters_list_description_block__header chartreuse">Зелёный чекбокс:</p>
                            <p class="mainFilters_list_description_block__text">У фильтров котороые могут в нескольких вариантах на комикс</p>
                            <p class="mainFilters_list_description_block__text">Выбрано несколько зелёных на 1 фильтр - будет искать комикс где есть оба</p>
                        </div>
                        <div class="mainFilters_list_description_block">
                            <p class="mainFilters_list_description_block__header tomato">Красный чекбокс:</p>
                            <p class="mainFilters_list_description_block__text">У фильтров котороые могут в нескольких вариантах на комикс</p>
                            <p class="mainFilters_list_description_block__text">Просто исключает комиксы с таким вариантом</p>
                        </div>
                    </div>
                    <button
                            class="mainFilters_list__openDescription"
                            @click="[
                                fakeElementsRef.isFiltersDescriptionOpen=!fakeElementsRef.isFiltersDescriptionOpen,
                                scrollIntoMainFiltersList()]"
                    >{{fakeElementsRef.isFiltersDescriptionOpen?'Понятно':'Что это за светафор?'}}</button>
                </div>
                <div class="mainFilters_controlButtons">
                    <button
                            class="mainFilters_controlButtons__button"
                            type="submit"
                            @click="[filteringComicsList(),filterOpenForMobile=false]"
                    >Показать</button>
                    <button
                            class="mainFilters_controlButtons__button"
                            type="button"
                            @click="[clearFilters(),filterOpenForMobile=false]"
                    >Сбросить</button>
                </div>
            </div>
            <div
                    v-for="(filterItem,filterIndex) in flLoadedSeparate"
                    class="separateFilters"
                    :class="{'separateFilters-open':fakeElementsRef[filterItem.name+'IsOpen']}"
            >
                <div class="separateFilters_control">
                    <div class="separateFilters_control_nav">
                        <button
                                type="button"
                                class="separateFilters_control_nav__goBackBtn"
                                @click="fakeElementsRef[filterItem.name+'IsOpen']=!fakeElementsRef[filterItem.name+'IsOpen']"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                                <path d="M329.6 24c-18.4-32-64.7-32-83.2 0L6.5 440c-18.4 31.9 4.6 72 41.6 72H528c36.9 0 60-40 41.6-72l-240-416z"/></svg>
                            <span>{{filterItem.ruName}}</span>
                        </button>
                        <button
                                type="button"
                                class="separateFilters_control_nav__clearBtn"
                                @click="flChecked[filterItem.name]={}"
                        >Очистить</button>
                    </div>
                    <input
                            class="separateFilters_control__searchInput"
                            type="text"
                            placeholder="поиск"
                            v-model="fakeElementsRef[filterItem.name+'Searching']"
                    >
                </div>
                <div class="separateFilters_list">
                    <div class="separateFilters_list_popular" v-if="!fakeElementsRef[filterItem.name+'Searching']">
                        <p class="separateFilters_list_popular__name">Популярные</p>
                        <div class="separateFilters_list_popular_content">
                            <button
                                    type="button"
                                    class="separateFilters_list_popular_content__fakeCheckbox fakeTripleCheckWithText"
                                    v-for="(variationItem,variationIndex) in filterItem.items.filter(val=>val.dontShow!==true)
                                    .sort((k,l)=>(l.sum-k.sum)).slice(0,6)"
                                    :class="{
                                        'fakeTripleCheckWithText-noMatter':(filterItem.isMultiple && flChecked[filterItem.name][variationItem.name]===undefined),
                                        'fakeTripleCheckWithText-include':(filterItem.isMultiple && flChecked[filterItem.name][variationItem.name]===true),
                                        'fakeTripleCheckWithText-exclude':(filterItem.isMultiple && flChecked[filterItem.name][variationItem.name]===false),
                                        'fakeDoubleCheckWithText-noMatter':(!filterItem.isMultiple && flChecked[filterItem.name][variationItem.name]===undefined),
                                        'fakeDoubleCheckWithText-include':(!filterItem.isMultiple && flChecked[filterItem.name][variationItem.name]===true),}"
                                    @click="filterItem.isMultiple?
                                        (flChecked[filterItem.name][variationItem.name]===undefined?
                                            flChecked[filterItem.name][variationItem.name]=true:
                                            flChecked[filterItem.name][variationItem.name]===true?
                                                flChecked[filterItem.name][variationItem.name]=false:
                                                flChecked[filterItem.name][variationItem.name]=undefined):
                                        (flChecked[filterItem.name][variationItem.name]===undefined?
                                            flChecked[filterItem.name][variationItem.name]=true:
                                            flChecked[filterItem.name][variationItem.name]=undefined)"
                            >
                                <div></div>
                                <span class="robotoLight">{{variationItem.ruName}}</span><span class="robotoLight">{{variationItem.sum}}</span>
                            </button>
                        </div>
                    </div>
                    <div class="separateFilters_list_alphabet">
                        <p class="separateFilters_list_alphabet__name">По алфавиту</p>
                        <div class="separateFilters_list_alphabet_content">
                            <button
                                    type="button"
                                    class="separateFilters_list_alphabet_content__fakeCheckbox fakeTripleCheckWithText"
                                    v-for="(variationItem,variationIndex) in (fakeElementsRef[filterItem.name+'Searching']===undefined?
                                    filterItem.items.filter(val=>val.dontShow!==true).sort((k,l)=>(k.ruName.localeCompare(l.ruName))):
                                    filterItem.items.filter(val=>val.dontShow!==true).sort((k,l)=>(k.ruName.localeCompare(l.ruName)))
                                    .filter(val=>(val.ruName.toLowerCase().includes(fakeElementsRef[filterItem.name+'Searching'].toLowerCase()))))"
                                    :class="{
                                        'fakeTripleCheckWithText-noMatter':(filterItem.isMultiple && flChecked[filterItem.name][variationItem.name]===undefined),
                                        'fakeTripleCheckWithText-include':(filterItem.isMultiple && flChecked[filterItem.name][variationItem.name]===true),
                                        'fakeTripleCheckWithText-exclude':(filterItem.isMultiple && flChecked[filterItem.name][variationItem.name]===false),
                                        'fakeDoubleCheckWithText-noMatter':(!filterItem.isMultiple && flChecked[filterItem.name][variationItem.name]===undefined),
                                        'fakeDoubleCheckWithText-include':(!filterItem.isMultiple && flChecked[filterItem.name][variationItem.name]===true),}"
                                    @click="filterItem.isMultiple?
                                        (flChecked[filterItem.name][variationItem.name]===undefined?
                                            flChecked[filterItem.name][variationItem.name]=true:
                                            flChecked[filterItem.name][variationItem.name]===true?
                                                flChecked[filterItem.name][variationItem.name]=false:
                                                flChecked[filterItem.name][variationItem.name]=undefined):
                                        (flChecked[filterItem.name][variationItem.name]===undefined?
                                            flChecked[filterItem.name][variationItem.name]=true:
                                            flChecked[filterItem.name][variationItem.name]=undefined)"
                            >
                                <div></div>
                                <span class="robotoLight">{{variationItem.ruName}}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<style lang="scss" scoped>
    .wrapForFiltersPanel{
        height: 100%;
    }
    .filersForm{
        height: 100%;
        position: relative;
        overflow: hidden;
    }
    .mainFilters,.separateFilters{
        width: 100%;
        height: 100%;
        position: absolute;
        transition: opacity 0.3s ease;
        //----
        display: flex;
        flex-direction: column;
        &_list{
            overflow: auto;
        }
    }
    .mainFilters{
        &_list{
            display: flex;
            flex-direction: column;
            gap: 20px;
            &>:last-child{
                margin-bottom: 20px;
            }
            &_openSeparates{
                display: flex;
                flex-direction: column;
                &__button{
                    border: inherit;
                    border-bottom: 2px solid #2b2b2c;
                    border-radius: inherit;
                    background-color: #313336;
                    //----
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    &:hover{
                        transition: all .1s ease-in-out;
                        background-color: #2b2b2c;
                    }
                    &:active{
                        transition: all .1s ease-in-out;
                        color: orange;
                        &>span{
                            transition: all .1s ease-in-out;
                            color: orange;
                        }
                        &>svg{
                            transition: all .1s ease-in-out;
                            fill: orange;
                        }
                    }
                    &>span{
                        transition: all .1s ease-in-out;
                    }
                    &>svg{
                        margin-left: 12px;
                        fill: aliceblue;
                        height: .5rem;
                        transform: rotate(90deg);
                        transition: all .1s ease-in-out;
                    }
                }
            }
            &_numericalFilters{
                display: flex;
                flex-direction: column;
                gap: 20px;
                &_filter{
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    &__name{
                        margin: 0 10px;
                    }
                    &_content{
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        &__input{
                            background-color: #313336;
                            border: inherit;
                            //----
                            width: 10px;
                            flex-grow: 1;
                            text-align: center;
                            &:hover{
                                transition: all .1s ease-in-out;
                                background-color: #2b2b2c;
                            }
                            &:focus{
                                transition: all .1s ease-in-out;
                                background-color: #2b2b2c;
                            }
                        }
                        &__span{}
                    }
                }
            }
            &_commonFilters{
                display: flex;
                flex-direction: column;
                gap: 20px;
                &_filter{
                    display: flex;
                    flex-direction: column;
                    gap: 2.5px;
                    &__name{
                        margin: 0 10px;
                    }
                    &_content{
                        display: flex;
                        flex-wrap: wrap;
                        &__fakeCheckbox{
                            padding: 2.5px 10px;
                            flex-grow: 1;
                            width: fit-content;
                            min-width: 50%;
                            &:hover{}
                            &:active{}
                            &>div{
                                border: inherit;
                                box-shadow: 0 0 2px 1px #5f6161;
                            }
                            &>span{
                                white-space: nowrap;
                            }
                            &-noMatter>div{}
                            &-include>div{}
                        }
                    }
                }
            }
            &_description{
                margin: 0 10px;
                display: flex;
                flex-direction: column;
                gap: 20px;
                &_block{
                    &__text{
                        font-size: .9rem;
                        font-family: Roboto Light, sans-serif;
                        &:first-child{
                            font-size: 1rem;
                        }
                    }
                }
            }
            &__openDescription{
                background-color: #3c3f41;
                padding: 0;
                border: none;
                border-radius: initial;
                width: 100%;
                line-height: 1.5rem;
                transition: all .1s ease-in-out;
                &:hover{
                    transition: all .1s ease-in-out;
                    background-color: #2b2b2c;
                }
            }
        }
        &_controlButtons{
            margin-top: auto;
            display: flex;
            justify-content: space-between;
            &__button{
                border-radius: inherit;
                border: inherit;
                //----
                flex-grow: 1;
                padding: 15px 0;
                &:hover{
                    background-color: #2b2b2c;
                    transition: all .1s ease-in-out;
                }
                &:active{
                    transition: all .1s ease-in-out;
                    color: orange;
                }
            }
        }
    }
    .separateFilters{
        background-color: #3c3f41;
        left: 100%;
        transition: all .3s ease-in-out;
        //----
        display: flex;
        flex-direction: column;
        &-open{
            left: 0;
            transition: all .3s ease-in-out;
        }
        &_control{
            &_nav{
                display: flex;
                &__goBackBtn,&__clearBtn{
                    border: inherit;
                    border-bottom: 2px solid #2b2b2c;
                    border-radius: inherit;
                    background-color: #313336;
                    //----
                    &:hover{
                        transition: all .1s ease-in-out;
                        background-color: #2b2b2c;
                    }
                    &:active{
                        transition: all .1s ease-in-out;
                        color: orange;
                        &>span{
                            transition: all .1s ease-in-out;
                            color: orange;
                        }
                        &>svg{
                            transition: all .1s ease-in-out;
                            fill: orange;
                        }
                    }
                }
                &__goBackBtn{
                    display: flex;
                    align-items: center;
                    width: 71%;
                    &>span{
                        transition: all .1s ease-in-out;
                    }
                    &>svg{
                        margin-right: 12px;
                        fill: aliceblue;
                        height: .5rem;
                        transform: rotate(-90deg);
                        transition: all .1s ease-in-out;
                    }
                }
                &__clearBtn{
                    width: 29%;
                    height: auto;
                }
            }
            &__searchInput{
                background-color: #313336;
                border: inherit;
                border-bottom: 2px solid #2b2b2c;
                //----
                width: 100%;
                &:hover{
                    transition: all .1s ease-in-out;
                    background-color: #2b2b2c;
                }
                &:focus{
                    transition: all .1s ease-in-out;
                    background-color: #2b2b2c;
                }
            }
        }
        &_list{
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding: 20px 0;
            &_popular,&_alphabet{
                display: flex;
                flex-direction: column;
                gap: 2.5px;
                &__name{
                    margin: 0 10px;
                }
                &_content{
                    &__fakeCheckbox{
                        padding: 2.5px 10px;
                        flex-grow: 1;
                        &:hover{}
                        &:active{}
                        &>div{
                            border: inherit;
                            box-shadow: 0 0 2px 1px #5f6161;
                        }
                        &>span{
                            white-space: nowrap;
                        }
                        &-noMatter>div{}
                        &-include>div{}
                    }
                }
            }
            &_popular_content__fakeCheckbox>span:last-child{
                margin-left: auto;
            }
        }
    }
    .fakeTripleCheckWithText-noMatter>div,.fakeDoubleCheckWithText-noMatter>div{
        background-color: #313336;
    }
</style>