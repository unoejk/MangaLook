<script setup="">
    // core
    import {ref} from 'vue'

    // pinia
    import {useRegisterStore} from "../../stores/register";
    const {tryLogged,tryRegister}=useRegisterStore()

    // parent function
    const props=defineProps(['closeOverwrite'])

    // mistakesArray
    let mistakesListOpen=ref(false)
    let mistakesArray=ref([])
    const closeMistakesMessage=()=>{
        mistakesListOpen.value=false
        mistakesArray.value=[]
    }

    // signIn or signUp
    let isSignIn=ref(true)

    // signIn form
    let inLogin=''
    let inPassword=''
    const submitInForm=async ()=>{
        const result=await tryLogged(inLogin,inPassword)
        if (result===true){
            await props.closeOverwrite()
        }else{
            mistakesArray.value=result
            mistakesListOpen.value=true
        }
    }

    // signUp form
    let upEmail=''
    let upLogin=''
    let upPassword=''
    let upConfirmPassword=''
    const submitUpForm=async ()=>{
        const result=await tryRegister(upEmail,upLogin,upPassword,upConfirmPassword)
        // tryRegister() сама по себе запускает попытку зарегестрироваться,
        // и делает это в случае если всё поодходит
        // также она возвращает true или массив с ошибками в зависимости от результата
        if (result===true){
            await tryLogged(upLogin,upPassword)
            await props.closeOverwrite()
        }else {
            mistakesArray.value=result
            mistakesListOpen.value=true
        }
    }
</script>

<template>
    <div class="wrapForRegister">
        <form class="signInForm" @submit.prevent="submitInForm" v-if="isSignIn">
            <h1>Вход</h1>
            <br><br>
            <input type="text" v-model="inLogin" placeholder="login">
            <input type="password" v-model="inPassword" placeholder="password">
            <br><br>
            <button type="submit">Войти</button>
            <button type="button" @click="isSignIn=!isSignIn">К окну регистрации</button>
        </form>
        <form class="signUpForm" @submit.prevent="submitUpForm" v-if="!isSignIn">
            <h1>Регистрация</h1>
            <br><br>
            <input type="text" v-model="upEmail" placeholder="email">
            <input type="text" v-model="upLogin" placeholder="login">
            <input type="password" v-model="upPassword" placeholder="password">
            <input type="password" v-model="upConfirmPassword" placeholder="confirm password">
            <br><br>
            <button type="submit">Зарегестрироваться</button>
            <button type="button" @click="isSignIn=!isSignIn">К окну входа</button>
        </form>
        <transition name="demoTransition">
            <div class="mistakesList" v-if="mistakesListOpen">
                <p v-for="(mistakesItem,mistakesIndex) in mistakesArray">{{mistakesItem}}</p>
                <button type="button" @click="closeMistakesMessage()">Понятно</button>
            </div>
        </transition>
    </div>
</template>

<style lang="scss" scoped>
    .wrapForRegister{
        background-color: #3c3f41;
        outline: 2px solid aliceblue;
        min-width: 400px;
        border-radius: 15px;
    }
    .signInForm,.signUpForm{
        margin: 30px;
        display: flex;
        flex-direction: column;
        &>*{
            margin-bottom: 10px;
        }
        &>:last-child{
            margin-bottom: 0;
        }
        &>*{
            width: 100%;
        }
        &>h1{
            text-align: center
        }
        &>input{}
        &>button{}
    }
    .signInForm{}
    .signUpForm{}
</style>