<script setup="">
    // core
    import {ref} from 'vue'

    // components
    import Register from './Register.vue'

    // router v1
    import {useRoute, useRouter} from 'vue-router'
    const router=useRouter()
    const route=useRoute()

    // router push
    const rPush=(way)=>{
        router.push({name:way})
    }

    // pinia
    import {useRegisterStore} from "../../stores/register";
    const {setLoggedFalseOnly,tryAutoLogged}=useRegisterStore()
    // reactive pinia
    import {storeToRefs} from 'pinia'
    const {getLoggedInfo}=storeToRefs(useRegisterStore())
    // fast func from pinia
    tryAutoLogged()

    // overwrite
    let overwriteOpen=ref(false)

    // for using in component
    const closeOverwrite=()=>{
        overwriteOpen.value=false
    }
</script>

<template>
    <div class="wrapForMainPageWrapper">
        <div class="header">
            <div class="header_left">
                <button class="header__title" @click="rPush('search')">MangaLook</button>
            </div>
            <div class="header_center">
                <button
                        class="header_buttonReplete"
                        :class="{'header_buttonReplete-choiced':route.path==='/'}"
                        @click="rPush('search')"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
                    <span>Поиск</span>
                </button>
                <button
                        class="header_buttonReplete"
                        :class="{'header_buttonReplete-choiced':route.path==='/add'}"
                        @click="rPush('add')"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>
                    <span>Добавить комикс</span>
                </button>
            </div>
            <div class="header_right">
                <button
                        class="header_buttonReplete"
                        @click="overwriteOpen=true"
                        v-if="!getLoggedInfo.isLogged"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path d="M217.9 105.9L340.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L217.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1L32 320c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM352 416l64 0c17.7 0 32-14.3 32-32l0-256c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c53 0 96 43 96 96l0 256c0 53-43 96-96 96l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z"/></svg>
                    <span>Войти</span>
                </button>
                <button
                        class="header_buttonReplete"
                        @click="setLoggedFalseOnly(false)"
                        v-if="getLoggedInfo.isLogged"
                >
                    <span>{{getLoggedInfo.loggedUser.login}}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"/></svg>
                </button>
            </div>
        </div>
        <div class="main">
            <slot></slot>
        </div>
        <transition name="demoTransition">
            <div class="overwrite" @mousedown.self="overwriteOpen=false" v-if="overwriteOpen">
                <Register :closeOverwrite="closeOverwrite"/>
            </div>
        </transition>
    </div>
</template>

<style lang="scss" scoped>
    $mainMaxWidth: 1200px;
    .wrapForMainPageWrapper{
        background-color: #2b2b2c;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }
    .header{
        background-color: #3c3f41;
        height: 50px;
        display: flex;
        justify-content: center;
        position: relative;
        &_left{
            position: absolute;
            left: 0;
            height: 100%;
        }
        &_center{
            position: absolute;
            display: flex;
            height: 100%;
        }
        &_right{
            position: absolute;
            right: 0;
            height: 100%;
        }
        &__title{
            background-color: inherit;
            font: inherit;
            cursor: pointer;
            border: none;
            border-radius: inherit;
            //----
            font-size: 2.4rem;
            height: 100%;
            padding: 0 20px;
            &:hover{
                background-color: #2b2b2c;
                transition: all .3s ease-in-out;
            }
            &:active{
                transition: all .1s ease-in-out;
                color: #ffa500;
            }
        }
        &__text{
            color: aliceblue;
            display: flex;
            align-items: center;
            text-align: center;
            font-size: 1rem;
            height: 100%;
            margin: 0 20px;
        }
        &_buttonReplete{
            background-color: inherit;
            font: inherit;
            cursor: pointer;
            border: none;
            border-radius: inherit;
            //----
            color: aliceblue;
            display: flex;
            align-items: center;
            gap: 10px;
            height: 100%;
            padding: 0 20px;
            font-size: 1.2rem;
            transition: all .3s ease-in-out;
            &>svg{
                fill: aliceblue;
                height: 1.2rem;
            }
            &>span{
                color: aliceblue;
                padding: 0;
            }
            &:hover{
                background-color: #2b2b2c;
                transition: all .3s ease-in-out;
            }
            &:active{
                transition: all .1s ease-in-out;
                color: orange;
                &>svg{
                    transition: all .1s ease-in-out;
                    fill: orange;
                }
                &>span{
                    transition: all .1s ease-in-out;
                    color: orange;
                }
            }
            &-choiced{
                color: orange;
                &>svg{
                    fill: orange;
                }
                &>span{
                    color: orange;
                }
            }

        }
    }
    .main{
        margin: 0 auto;
        width: 100%;
        max-width: $mainMaxWidth;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }
    .overwrite{
        background-color: rgba(255, 255, 255, 0.2);
        position: fixed;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        z-index: 2;
    }
    @media screen and (max-width: 767px){
        .header__title{
            font-size: 2rem;
            line-height: 2.5rem;
        }
        .header_center>.header_buttonReplete{
            &>span{
                display: none;
            }
        }
    }
</style>