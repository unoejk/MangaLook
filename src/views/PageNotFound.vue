<script setup="">
    // router
    import router from "../routes";
</script>

<template>
    <div class="wrapForPageNotFound">
        <h1 class="message">Такой страницы нет</h1>
        <div class="routeVariants">
            <button class="routeVariants__variant" @click="router.push({name:'search'})">На главную</button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    .wrapForPageNotFound{
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .message{
        font-size: 5rem;
    }
    .routeVariants{
        margin-top: 100px;
        outline: 5px solid #2b2b2c;
        border-radius: 1rem;
        &__variant{
            font: inherit;
            cursor: pointer;
            background-color: inherit;
            border: none;
            //----
            font-size: 3rem;
            padding: 1rem;
            transition: all .3s ease-in-out;
            &:hover{
                transition: all .3s ease-in-out;
                background-color: #2b2b2c;
            }
        }
    }
</style>