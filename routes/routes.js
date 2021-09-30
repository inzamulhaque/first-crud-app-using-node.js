const express = require("express");
const router = express.Router();
const User = require("../models/user");
const multer = require("multer");
const fs = require("fs");

// image upload
var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./uploads")
    },
    filename: function(req, file, cd){
        cd(null, file.fieldname+"_"+Date.now()+"_"+file.originalname);
    },
});

var upload = multer({
    storage: storage
}).single("image");

// get all user
router.get("/", (req, res) => {
    User.find().exec((err, users) => {
        if(err){
            res.json({message: err.message});
        } else {
            res.render("index", {
                title: "CRUD - Home Page - MD IH Alif",
                users: users
            });
        }
    });
});

router.get("/add", (req, res) => {
    res.render("add_user", {
        title: "CRUD - Add Users - MD IH Alif"
    });
});

// insert user
router.post("/add", upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename
    });
    user.save((err) => {
        if(err){
            res.json({message: err.message, type: "danger"});
        } else {
            req.session.message = {
                type: "success",
                message: "User added successfully!"
            };
            res.redirect("/");
        }
    });
});

// get edit page
router.get("/edit/:id", (req, res) => {
    let id = req.params.id;
    User.findById(id, (err, user) => {
        if(err){
            res.redirect("/");
        } else {
            if(user == null) {
                res.redirect("/");
            } else {
                res.render("edit_user", {
                    title: "CRUD - Edit Users - MD IH Alif",
                    user: user
                });
            }
        }
    });
});

// update user
router.post("/update/:id", upload, (req, res) => {
    let id = req.params.id;
    let new_image = "";

    if(req.file){
        new_image = req.file.filename;
        try {
            fs.unlinkSync("./uploads/"+req.body.old_image);
        } catch(err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }

    User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image
    }, (err, result) => {
        if(err){
            res.json({ message: err.message, type: "danger" });
        } else {
            req.session.message = {
                type: "success",
                message: "User Updated successfully!"
            };
            res.redirect("/");
        }
    });
});

// delete user
router.get("/delete/:id", (req, res) => {
    let id = req.params.id;
    User.findByIdAndRemove(id, (err, result) => {
        if(result.image != ""){
            try {
                fs.unlinkSync("./uploads/"+result.image);
            } catch (error) {
                console.log(error);
            }
        }
        if(err){
            res.json({ message: err.message, type: "danger" });
        } else {
            req.session.message = {
                type: "success",
                message: "User Deleted successfully!"
            };
            res.redirect("/");
        }
    });
});

module.exports = router;