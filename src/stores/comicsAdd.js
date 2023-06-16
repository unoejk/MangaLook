// pinia
import {defineStore} from 'pinia'

// _global
import {toCamelCase,deepClone} from './_global'

// axios
import {axGet,axPost,axPatch,axRefreshId} from './_axios.js'

export const useComicsAddStore = defineStore({
    id: 'comicsAddStore',
    state: () => ({
        flNeed:[
            "ageRating",
            "type",
            "releaseFormat",
            "transferStatus",
            "titleStatus",
            "other",
            "tags",
            "genres",
        ],
        flLoadedSimple:[],
        flLoadedMultiple:[],
        defaultNewComics:{
            chaptersSum:0,
            viewsSum:0,
            scoreDetail:{'1':0,'2':0,'3':0,'4':0,'6':0,'7':0,'8':0,'9':0,'10':0},
            scoreSum:0,
            rating:0,
        },
        newComics:{},
        mistakesArray:[],

    }),
    actions: {
        async fastStartedFuncs() {
            this.newComics=this.defaultNewComics
            await this.fsfLoadFiltersList()
            this.newComics=deepClone(this.defaultNewComics)
        },
        async fsfLoadFiltersList(){
            const params=new URLSearchParams();
            for (let filter of this.flNeed){
                params.append("name",filter)
            }
            const loadedList=await axGet('comicsInfo/',params)
            loadedList.forEach((val,num)=>{
                loadedList[num].items.sort((k,l)=>(l.sum-k.sum))
            })
            this.flLoadedSimple=[]
            this.flLoadedMultiple=[]
            loadedList.forEach(filter=>{
                if (filter.isMultiple===true){
                    this.flLoadedMultiple.push(filter)
                    this.defaultNewComics[filter.name]=[]
                }else {
                    this.flLoadedSimple.push(filter)
                    this.defaultNewComics[filter.name]=undefined
                }
            })
        },
        async tryAdd(){
            // Заглушки
            // this.newComics.contentIdList=[[]]
            // this.newComics.scoreSum=parseInt((Math.random()*10).toFixed(0))
            // this.newComics.viewsSum=parseInt((Math.random()*10).toFixed(0))
            // this.newComics.chaptersSum=parseInt((Math.random()*10).toFixed(0))
            // this.newComics.releaseYear=(2000+(parseInt((Math.random()*23).toFixed(0))))
            // this.newComics.addedDate=new Date()
            // this.newComics.updateDate=new Date()
            // this.flLoadedMultiple.forEach((filterItem,filterIndex)=>{
            //     filterItem.items.forEach((variationItem,variationIndex)=>{
            //         if (Math.random()>0.8 && variationItem.dontShow!==true){
            //             this.newComics[filterItem.name].push(variationItem.name)
            //         }
            //     })
            // })
            // this.flLoadedSimple.forEach((filterItem,filterIndex)=>{
            //     filterItem.items.forEach((variationItem,variationIndex)=>{
            //         if (Math.random()>0.3 && variationItem.dontShow!==true){
            //             this.newComics[filterItem.name]=variationItem.name
            //         }
            //     })
            // })
            // await this.checkForm()
            // this.newComics.id=await axRefreshId('comics/0')
            // await axPost('comics/',this.newComics)
            // this.flLoadedMultiple.forEach((filterItem,filterIndex)=>{
            //     this.newComics[filterItem.name]=[]
            // })
            // return true
            await this.checkForm()
            if (this.mistakesArray[0]===undefined){
                this.newComics.addedDate=new Date()
                this.newComics.updateDate=new Date()
                // this.newComics.creator=getLoggedInfo.loggedUser.login
                this.newComics.id=await axRefreshId('comics/0')
                this.newComics.contentIdList=[[]]
                await this.patchSums()
                await axPost('comics/',this.newComics)
                return true
            }else {
                return false
            }
        },
        async checkForm(){
            this.mistakesArray=[]

            if (this.newComics.ruName===undefined || this.newComics.ruName===''){
                this.mistakesArray.push(`Название должно быть указано`)
            }else {
                if (this.newComics.orName===undefined || this.newComics.orName===''){
                    this.newComics.orName=this.newComics.ruName
                }
                if (this.newComics.name===undefined || this.newComics.name===''){
                    this.newComics.name=toCamelCase(this.newComics.ruName)
                }
            }
            if (this.newComics.releaseYear===undefined || this.newComics.releaseYear===''){
                this.mistakesArray.push(`Год выпуска должен быть указан`)
            }
            if (this.newComics.ruName===undefined || this.newComics.ruName===''){
                this.mistakesArray.push(`Описание должно быть указано`)
            }

            if (this.newComics.img===undefined || this.newComics.img===''){
                if (this.newComics.imgFile===undefined){
                    this.mistakesArray.push(`Нужно добавить картинку`)
                }else {
                    this.newComics.img=this.newComics.imgFile
                }
            }
            delete this.newComics.imgFile

            this.flLoadedSimple.forEach((filterItem,filterIndex)=>{
                if (this.newComics[filterItem.name]===undefined && filterItem.isRequired===true){
                    this.mistakesArray.push(`${filterItem.ruName} - должен быть выбран`)
                }
            })
            this.flLoadedMultiple.forEach((filterItem,filterIndex)=>{
                if (this.newComics[filterItem.name][0]===undefined && filterItem.isRequired===true){
                    this.mistakesArray.push(`${filterItem.ruName} - должен быть выбран хотя-бы один`)
                }
            })
        },
        async patchSums(){
            for (let filterNum in this.flLoadedSimple){
                if (this.newComics[this.flLoadedSimple[filterNum].name]!==undefined){
                    this.flLoadedSimple[filterNum].items.forEach((variationObj,variationNum)=>{
                        if (variationObj.name===this.newComics[this.flLoadedSimple[filterNum].name]){
                            this.flLoadedSimple[filterNum].items[variationNum].sum++
                        }
                    })
                    await axPatch('comicsInfo/'+this.flLoadedSimple[filterNum].id,{items:this.flLoadedSimple[filterNum].items})
                }
            }
            for (let filterNum in this.flLoadedMultiple){
                if (this.newComics[this.flLoadedMultiple[filterNum].name][0]!==undefined){
                    this.newComics[this.flLoadedMultiple[filterNum].name].forEach(activeFilterName=>{
                        this.flLoadedMultiple[filterNum].items.forEach((variationObj,variationNum)=>{
                            if (variationObj.name===activeFilterName){
                                this.flLoadedMultiple[filterNum].items[variationNum].sum++
                            }
                        })
                    })
                    await axPatch('comicsInfo/'+this.flLoadedMultiple[filterNum].id,{items:this.flLoadedMultiple[filterNum].items})
                }
            }
        },
        clearNewComics(){
            this.newComics=deepClone(this.defaultNewComics)
        },
    },
    getters: {},
})