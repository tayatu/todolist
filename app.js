//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _=require("lodash");
const dotenv = require("dotenv");
const app = express();


dotenv.config();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const connect = () => {
  mongoose
    .connect(process.env.MONGO)
    .then(() => {
      console.log("Connected to DataBase");
    })
    .catch((err) => {
      throw err;
    });
};


const itemsSchema = new mongoose.Schema({
  name: String
});
const item = mongoose.model("ITEM", itemsSchema);
const item1 = new item({
  name: "Buy Food"
});
const item2 = new item({
  name: "Cook Food"
});
const item3 = new item({
  name: "Eat Food"
});

const thing = [item1, item2, item3];
const listSchema = new mongoose.Schema({
  name: String,
  item: [itemsSchema]
});
const List = mongoose.model("List", listSchema)

app.get("/", function(req, res) {
     //item is a document
  item.find({}, function(err, data) {
    if (data.length=== 0) {
      item.insertMany(thing, function(err) {
        if (err) {
          console.log(err);
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: data
      });
    }
  });

});
app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName}, function(err, data) {
    if (!err) {
      if (!data) {
        const lst = new List({
          name: customListName,
          item: thing
        });
        lst.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: data.name,
          //data.item is an array
          newListItems: data.item
        });
      }
    }
  });
});
app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const it = new item({
    name: itemName
  });
  if (listName ==="Today") {
    it.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, data) {
         if(!err){
              data.item.push(it);
             data.save();
             res.redirect("/" + listName);
         }
         else{
              console.log(err);
         }

    });
  }
});


app.post("/delete", function(req, res) {
     const checkItemById=req.body.checkbox;
     const listName=req.body.listName;
     if(listName==="Today"){
          item.findByIdAndRemove(checkItemById,function(err){
               if(!err){
                    res.redirect("/");
               }
          });
     }
     else{
          List.findOneAndUpdate(
               {name: listName},
               {$pull:{ item:{_id:checkItemById}}},
               function(err,data){
                    if(!err){
                         res.redirect("/"+listName);
                    }
               });
          }
     });

let port=process.env.PORT;
if(port==null || port==""){
     port=3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
  connect();
});
