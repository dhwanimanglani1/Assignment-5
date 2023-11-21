/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Dhwani Vijaykumar Manglani Student ID: 167514215 Date: 20/11/23
*
*  Online (Cyclic) Link: https://delightful-jade-quail.cyclic.app

*
********************************************************************************/ 

var express = require("express");
const { sendFile } = require("express/lib/response");
var path = require("path");
var blog = require("./blog-service.js");
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const exphbs = require("express-handlebars");
const stripJs = require('strip-js');

var app = express();

var HTTP_PORT = process.env.PORT || 8080;
 
cloudinary.config({
    cloud_name: 'dlajc8bcv',
    api_key: '172615327293696',
    api_secret: 'pVKx-1iA1VC_q-fJwq2Me7fH1xQ',
    secure: true
  });

const upload = multer(); // no { storage: storage } since we are not using disk storag

app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    helpers: {
        navLink: function(url, options){
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options){
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context){
            return stripJs(context);
        },
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }
    }
}));
app.set("view engine", ".hbs");

app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});


// call this function after the http server starts listening for requests
function onHttpStart() {
    console.log("Express http server listening on " + HTTP_PORT);
};

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.redirect("/blog");
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get('/blog', async (req, res) => {

    let viewData = {};

    try{

        let posts = [];

        if(req.query.category){
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        }else{
            posts = await blog.getPublishedPosts();
        }

        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        let post = posts[0]; 

        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        let categories = await blog.getCategories();

        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    res.render("blog", {data: viewData})

});

app.get('/blog/:id', async (req, res) => {

    let viewData = {};

    try{

        let posts = [];

        if(req.query.category){
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        }else{
            posts = await blog.getPublishedPosts();
        }

        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        viewData.post = await blog.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{        let categories = await blog.getCategories();

        
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

app.get("/posts", (req, res) => {
    if (req.query.category) {
        blog.getPostsByCategory(req.query.category).then((data) => {
            if (data.length > 0)
            {
                res.render("posts", { posts: data });
            }
            else
            {
                res.render("posts", { message: "no results" });
            }
        }).catch((err) => {
            res.render("posts", { message: err });
        });
    }
    else if (req.query.minDate) {
        blog.getPostsByMinDate(req.query.minDate).then((data) => {
            if (data.length > 0)
            {
                res.render("posts", { posts: data });
            }
            else
            {
                res.render("posts", { message: "no results" });
            }
        }).catch((err) => {
            res.render("posts", { message: err });
        });
    }
    else {
        blog.getAllPosts().then((data) => {
            if (data.length > 0)
            {
                res.render("posts", { posts: data });
            }
            else
            {
                res.render("posts", { message: "no results" });
            }
        }).catch((err) => {
            res.render("posts", { message: err });
        })
    }
});

app.get("/post/:value", (req, res) => {
    blog.getPostById(req.params.value).then((data) => {
        res.json(data);
    }).catch((err) => {
        res.json({ message: err });
    });
});

app.get("/categories", (req, res) => {
    blog.getCategories().then((data) => {
        if (data.length > 0)
        {
            res.render("categories", { categories: data });
        }
        else
        {
            res.render("categories", { message: "no results" });
        }
    }).catch((err) => {
        res.render("categories", { message: err });
    });
});

app.get("/posts/add", (req, res) => {
    blog.getCategories().then(data=>{
        res.render("addPost", {categories: data});
    }).catch(err=>{
        res.render("addPost", {categories: []});
    });
});

app.post("/posts/add", upload.single("featureImage"), (req, res) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        };


        upload(req).then((uploaded) => {
            processPost(uploaded.url);
        });
    } else {
        processPost("");
    }
    function processPost(imageUrl) {
        req.body.featureImage = imageUrl;


        blog.addPost(req.body).then((data) => {
            res.redirect("/posts");
        });
    };
});

app.get("/categories/add", (req,res)=>{
    res.render("addCategory");
});

app.post("/categories/add", (req,res)=>{
    blog.addCategory(req.body).then((data)=>{
        res.redirect("/categories");
    });
});

app.get("/categories/delete/:id", (req,res)=>{
    blog.deleteCategoryById(req.params.id).then((data)=>{
        res.redirect("/categories");
    }).catch(err=>{
        res.status(500).send("Unable to Remove Category / Category Not Found");
    });
});

app.get("/posts/delete/:id", (req,res)=>{
    blog.deletePostById(req.params.id).then((data)=>{
        res.redirect("/posts");
    }).catch(err=>{
        res.status(500).send("Unable to Remove Post / Post Not Found");
    });
});

app.use((req, res) => {
    res.status(404).render("404");
});

// setup http server to listen on HTTP_PORT
blog.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart);
}).catch((reason) => {
    console.log(reason);
});