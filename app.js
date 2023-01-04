//jshint esversion:6

const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser: true});

mongoose.connect("mongodb+srv://Yujing:Yujing@cluster0.uzkwj3i.mongodb.net/todolistDB",{useNewUrlParser: true});

// create new shcema
const itemsSchema = {
  name: String
};

const listSchema = {
  name: String,
  items: [itemsSchema]
}


// create mongoose model
const Item = mongoose.model('Item',itemsSchema);
const List = mongoose.model('List',listSchema);

// create new class
const item1 = new Item({ name: 'Welcome to your todolist!'});
const item2 = new Item({ name: 'Hit the +button to add a new item.'});
const item3 = new Item({ name: '<--Hit this to delete an item.'});

const defaultItems = [item1,item2,item3];

// Item.insertMany(defaultItems,function(err){
//   if (err){
//     console.log(err);
//   }else{
//     console.log("Successfully saved default items to DB.");
//   }
// });

// To do: how to render database items in the todolist app

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){
    if (foundItems.length === 0){
      //add new items to our todolist database
      Item.insertMany(defaultItems,function(err){
        if (err){
          console.log(err);
      }else{
        console.log("Successfully saved default items to DB.");
      }
    });
    res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })     
});

// create custom lists using express route parameters
// because there are uppercase initial letter and lower letter.so we can use lodash to keep the first letter to be uppercase
app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);  

  List.findOne({name:customListName},function(err,foundlist){
    if(!err){
      if (!foundlist){
        //creating new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save(); 
        res.redirect("/"+ customListName)
      }else{
        //show an existing list
        res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items});
      }
    }else{
      console.log(err);
    }
  });
});

// delete items from our todolist db

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName 
  });

  if(listName === 'Today'){
    item.save(); 
    res.redirect("/");
  }else{
    List.findOne({name: listName},function(err,foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listName);
    })
  }
  

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if (!err){
        console.log("Successfully delete checkbox items to DB.");
        res.redirect("/");
    }
    });
    // redirect the particular directory
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundlist){
        if(!err){
          res.redirect("/"+listName);
        }
    });
  }
  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
