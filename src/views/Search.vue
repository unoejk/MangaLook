<script setup="">
    // components
    import MainPageWrapper from '../components/_MainPageWrapper/MainPageWrapper.vue'
    import ContentPanel from '../components/forSearch/ContentPanel.vue'
    import FiltersPanel from '../components/forSearch/FiltersPanel.vue'
    import {ref} from "vue";

    //pinia
    import {useComicsSearchStore} from '../stores/comicsSearch'
    // const {}=useComicsSearchStore()
    // reactive pinia
    import {storeToRefs} from 'pinia'
    const {filterOpenForMobile}=storeToRefs(useComicsSearchStore())

    // scroll
    let filtersSideIsBig=ref(false)
    window.addEventListener('scroll', function() {
        filtersSideIsBig.value=document.scrollingElement.scrollTop>50;
    });
</script>

<template>
    <MainPageWrapper>
        <div class="wrapForSearch">
            <div class="contentSide" :isOpenForMobile="filterOpenForMobile===false">
                <ContentPanel/>
            </div>
            <div class="filtersSide" :class="{'filtersSide-big':filtersSideIsBig}" :isOpenForMobile="filterOpenForMobile===true">
                <FiltersPanel/>
            </div>
        </div>
    </MainPageWrapper>
</template>

<style lang="scss" scoped>
    .wrapForSearch{
        display: flex;

        flex-grow: 1;
    }
    .contentSide{
        background-color: #3c3f41;
        border-radius: 5px;
        overflow: hidden;
        width: calc((100% - 60px) * .71);
        margin: 20px 10px 20px 20px;
        height: auto;
    }
    .filtersSide{
        background-color: #3c3f41;
        border-radius: 5px;
        overflow: hidden;
        width: calc((100% - 60px) * .29);
        margin: 20px 20px 20px 10px;
        height: calc(100vh - 50px - 40px);
        position: sticky;
        top: 20px;
        &-big{
            height: calc(100vh - 40px)
        }
    }
    @media screen and (max-width: 991px){
        .contentSide{
            display: none;
            width: calc(100% - 40px);
            margin: 20px;
            &[isOpenForMobile=true]{
                display: block;
            }
        }
        .filtersSide{
            display: none;
            width: calc(100% - 40px);
            margin: 20px;
            &[isOpenForMobile=true]{
                display: block;
            }
        }
    }
</style>