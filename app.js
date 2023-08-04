const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname+"/date.js");
const _=require("lodash");
console.log(date);

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
    mongoose.set('strictQuery', true);
  await mongoose.connect('mongodb+srv://Admin-Shan:Sha123@cluster0.f4h26qn.mongodb.net/todolistDB',
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    );
  
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
  const itemSchema=new mongoose.Schema({
    name: String
});


const Item = mongoose.model('Item', itemSchema);

const document1 = new Item({
    name:"cook"
});
const document2 = new Item({
    name:"eat"
});
const document3 = new Item({
    name:"bath"
});

const arr = [document1,document2,document3];

const listSchema=new mongoose.Schema({
    name:String,
    item:[itemSchema]
});

const List=mongoose.model('list',listSchema);

app.get("/",function(req,res){
    Item.find({async:true}, function (err, docs) {
        if(err){
            console.log(err);
        }
        else{

            if(docs.length ===0 ){
                Item.insertMany(arr, function(error,docs) {
                    if(error){
                       console.log(err);
                    }
                    else{
                        res.redirect("/")
                    }
                });
            }else{
                res.render('list',{listTitle:"Today",newListItems:docs});
            }
        }
    });
   
})

app.post("/",function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list
    const value = new Item({
        name:itemName
    })
    
    if(req.body.list==='Today'){
        value.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName},function(err,findList){
            findList.item.push(value);
            findList.save();
            res.redirect("/"+listName);
        })
        
    }
    
})

app.post("/delete",function(req,res){
    const checkedItemId=req.body.checkbox;
    const checkedList=req.body.delItem;
    if(checkedList==="Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(!err){
                console.log("Success");
            }
        });
        res.redirect("/");
    }else{
        List.findOneAndUpdate({name:checkedList},{$pull:{item :{_id:checkedItemId}}},function(err,findList){
            if(!err){
                res.redirect("/"+checkedList);
            }
        })
    }
    
})

app.get("/:customList",function(req,res){
    const customValue=_.capitalize(req.params.customList);
   
    List.findOne({name:customValue},function(err,findList){
        if(!err){
            if(!findList){
                const list = new List({
                    name:customValue,
                    item:arr
                });
                list.save();
                res.redirect("/"+customValue);
            }else{
                res.render('list',{listTitle:customValue,newListItems:findList.item});
            }
        }
    })

})

}

app.get("/about",function(req,res){
    res.render('about');
})

app.listen(3000,function(){
    console.log("Server is running on port 3000");
})