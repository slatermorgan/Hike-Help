var mongoose = require("mongoose");
var Walk = require("./models/walk");
var Comment = require("./models/comment");

var data = [
        {
            name: "Llynnau Mymbyr",
            image: "https://images.unsplash.com/photo-1501838578394-0a4de3194324?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80",
            description: "Llynnau Mymbyr are two lakes located in Dyffryn Mymbyr, a valley running from the village of Capel Curig to the Pen-y-Gwryd hotel in Snowdonia, north-west Wales. The A4086 runs along their northern banks. Strictly speaking this is one lake, originally called Llyn Mymbyr.",
            author: {
                id : "588c2e092403d111454fff76",
                username: "Jack"
            }
        },
        {
            name: "Penrhyndeudraeth",
            image: "https://images.unsplash.com/photo-1492337384533-a211c15b6d64?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80",
            description: "Penrhyndeudraeth is a small town and community in the Welsh county of Gwynedd. The town is close to the mouth of the River Dwyryd on the A487 nearly 3 miles east of Porthmadog, and had a population of 2,150 at the 2011 census, increased from 2,031 in 2001.",
            author: {
                id : "588c2e092403d111454fff71",
                username: "Jill"
            }
        }
    ]

function seedDB(){
    // Remove all walks
    Walk.remove({}, function(err){
        if(err){
            console.log(err);
        } else {
            console.log("removed walks");
            // add some walks
            data.forEach(function(seed){
                Walk.create(seed, function(err, walk){
                    if(err){
                        console.log(err);
                    } else {
                        console.log("Walk added successfully");
                        // add some comments
                        Comment.create(
                            {
                                text: "This place is great but the paths could be marked better.",
                                author: "Tom"
                            }, function(err, comment){
                                if(err){
                                    console.log(err)
                                } else {
                                    walk.comments.push(comment);
                                    walk.save();
                                    console.log("Created new comment");
                                }
                            });
                    }
                });
            });
        }
    });
}

module.exports = seedDB;