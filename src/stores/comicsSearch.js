// pinia
import {defineStore} from 'pinia'

// _global
import {deepClone} from './_global'

// axios
import {axGet} from './_axios.js'

export const useComicsSearchStore = defineStore({
    id: 'comicsSearchStore',
    state: ()=>({
        filterOpenForMobile:false,
        comicsListDefault:[],
        comicsList:[],
        flNeed:[
            "ageRating",
            "type",
            "releaseFormat",
            "transferStatus",
            "titleStatus",
            "other",
            "genres",
            "tags",
            "chaptersSum",
            "releaseYear",
            "rating"
        ],
        flLoaded:[],
        flLoadedNumerical:[],
        flLoadedCommon:[],
        flLoadedSeparate:[],
        flCheckedDefault:{},
        flChecked:{},
    }),

    actions: {
        async fastStartedFuncs(){
            // быстро делает начальную загрузку и распределение
            // используется в ContentPanel.vue
            this.fsfLoadComicsDefault()
            await this.fsfLoadFiltersList()
            this.fsfMakeDifferentFiltersList()
        },
        async fsfLoadComicsDefault(){
            // закачивает комиксы, для отображения до применения фильтров
            // и сразу отсеивает с dontShow
            this.comicsListDefault=(await axGet('comics/')).filter(val=>val.dontShow!==true)
            this.comicsList=deepClone(this.comicsListDefault)
        },
        async fsfLoadFiltersList(){
            // закачивает информацию о нужных фильтрах, включая их вариации,
            // сделал отдельной функцией, чтобы не плодить лишние запросы
            const params=new URLSearchParams();
            for (let filters of this.flNeed){
                params.append("name",filters)
            }
            const loadedList=await axGet('comicsInfo/',params)  // await - так как надо дождаться перед упорядочиванием
            // заходит в вариации каждого фильтра, отсеивает все с dontShow и упорядочивает их массив по sum
            loadedList.forEach((val,num)=>{
                if (loadedList[num].items!==undefined){
                    loadedList[num].items=loadedList[num].items.filter(val=>val.dontShow!==true)
                    loadedList[num].items.sort((k,l)=>(l.sum-k.sum))
                }
            })
            this.flLoaded=loadedList
        },
        async fsfMakeDifferentFiltersList(){
            // разделяет общий список фильтров на 3 списка, отдельно Numerical, а оастальные на Common и Separate
            // также тут делаем список доступных фильтров для чекбоксов и инпутов: {'name1':{},name2:{},...}
            this.flLoadedNumerical=[]
            this.flLoadedCommon=[]
            this.flLoadedSeparate=[]
            this.flLoaded.forEach((val,num)=>{
                if (val.isNumerical){
                    this.flLoadedNumerical.push(val)
                }else {
                    if (val.items.length<=20){
                        this.flLoadedCommon.push(val)
                    }else {
                        this.flLoadedSeparate.push(val)
                    }
                }
                this.flCheckedDefault[val.name]={}
            })
            this.flChecked=deepClone(this.flCheckedDefault)
        },
        async filteringComicsList(){
            // фильтрует по всему что указали
            const result=[]
            this.comicsListDefault.forEach(comics=>{
                // заходим в каждый комикс
                let variationNotFound=false // потом пригодится в логике
                for (let filterName in this.flChecked){
                    // заходим в каждый фильтр в списке отмеченного
                    for (let variationName in this.flChecked[filterName]){
                        // заходим в каждую вариацию фильтра в списке отмеченного
                        // там будут только те, на которые мы кликали или что-то вводили

                        if (this.flChecked[filterName][variationName]===undefined || this.flChecked[filterName][variationName]===''){
                            // если вариия со значением undefined или '', идём сразу на следуюющую
                            continue
                        }

                        // сначала разбираемся в случае если вариация численная
                        // continue отправит нас сразу на следующую итерацию for, ко следующей вариации
                        // return отправит нас сразу на следующую итерацию forEach, к следующему комиксу
                        if (this.flLoaded.find(val=>val.name===filterName).isNumerical){
                            if (variationName==='min'){
                                if (comics[filterName]>=this.flChecked[filterName][variationName]){
                                    continue
                                }else {
                                    return
                                }
                            }else {
                                if (comics[filterName]<=this.flChecked[filterName][variationName]){
                                    continue
                                }else {
                                    return
                                }
                            }
                        }

                        // если вариация нашлась и она не численная, уточняем её мультипл
                        const isMultiple=this.flLoaded.find(val=>val.name===filterName).isMultiple

                        // ищём варицию в комиксе
                        // в зависимости от мультипла, она будет либо в массиве, либо строкой
                        let isFounded
                        if (isMultiple){
                            // для мультипла ищем по массиву
                            // вернётся либо строка либо undefined
                            // но нам подходит так как это true и false значения соответственно
                            isFounded=comics[filterName].find(val=>(val===variationName))
                        }else {
                            // для не мультипла просто сравниваем строки
                            isFounded=comics[filterName]===variationName
                        }

                        if (this.flChecked[filterName][variationName]===false){
                            // если указали false, значит вариации быть в комиксе не должно
                            // поэтому если она в комиксе нашлась, сразу идём ко следующему
                            if (isFounded){
                                // return отправит нас сразу на следующую итерацию forEach, к следующему комиксу
                                return
                            }else {
                                // continue отправит нас сразу на следующую итерацию for, ко следующей вариации
                                continue
                            }
                        }

                        // теперь остался вариант только с итерацией true
                        // в зависимости от мультипл она имеет разный смысл:
                        // если мультипл - должны быть совпадения по всем true из фильтра
                        // (указаны жанры 'романтика и комедия' - должно быть и то и то)
                        // если не мультипл мультипл - должно быть совпадения хотябы по одному true из фильтра
                        // (указаны возрастные рейтинги '16+' и '18+' - подойдёт и то и другое)
                        if (isFounded){
                            if (isMultiple){
                                // если в мультипле найденно совпадение, то пока нам всё подходит
                                // но для мультипла может быть указана обязательной ещё одна вариация,
                                // поэтому идём ко следующей
                                continue
                            }else {
                                // если в не мультипле совпадение найдено, значит комикс нам подходит
                                // так как значения false для не мультипла поставить нельзя, а true уже нашли -
                                // следующие вариации нас не интересуют и можем идти на следующий фильтр
                                // break закроет текущий for без перехода на следующую иитерацию
                                // перед этим отметим вариация таки найдена
                                variationNotFound=false
                                break
                            }
                        }else {
                            if (isMultiple){
                                // если в мультипле обязательная вариация не найденна - комикс не подходит
                                // идём ко следующей итерации forEach к следующему комиксу
                                return
                            }else {
                                // если в не мультипле итерации не нашлось, возможно указана ещё одна подходящая
                                // пойдём искать, но перед этим отметим что один раз уже не удалось найти
                                variationNotFound=true
                                continue
                            }
                        }
                    }
                    if (variationNotFound){
                        // если на выходе из фильтра это значение осталось в true
                        // значит ни одной искомой вариации не нашли и комикс нам не подходит
                        // идём ко следующей итерации forEach к следующему комиксу
                        return
                    }
                    // тут мы окажемся после прохождения очередного фильтра
                    // в случае если нас в нём всё устроило
                }
                // тут мы окажемся после прохождения всех фильтров в случае если нас всё устраивает в комиксе
                // можем спокойно добавлять его в отфильтрованный список
                result.push(comics)
            })
            // вот и всё
            this.comicsList=result
        },
        async clearFilters(){
            this.comicsList=deepClone(this.comicsListDefault)
            this.flChecked=deepClone(this.flCheckedDefault)
        },
    },
    getters: {
        getComicsList: state => state.comicsList,
    },
})