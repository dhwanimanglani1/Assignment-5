/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Dhwani Vijaykumar Manglani Student ID: 167514215 Date: 20/11/23
*
*  Online (Cyclic) Link: https://delightful-jade-quail.cyclic.app
  Github link: https://github.com/dhwanimanglani/Assignment-4
*
********************************************************************************/ 

const Sequelize = require('sequelize');

var sequelize = new Sequelize( 'SenecaDB', 'dhwanimanglani', 'le2VXWZfnt8I', {
  host: 'ep-weathered-frog-97604658-pooler.us-east-2.aws.neon.tech' ,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: require,
  },
  query: {
    raw: true,
  },
});

var Post = sequelize.define("Post", {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

var Category = sequelize.define("Category", {
    category: Sequelize.STRING
});

Post.belongsTo(Category, {foreignKey: 'category'});



// Exporting the 'initialize' function
module.exports.initialize = function () {
    // Returning a Promise for asynchronous handling
    return new Promise((resolve, reject) => {
        // Synchronizing the Sequelize model with the database
        sequelize.sync().then(() => {
            // If synchronization is successful, resolve the Promise
            resolve();
        }).catch(err => {
            // If an error occurs during synchronization, reject the Promise with an error message
            reject("Unable to sync the database");
        });
    });
};


// Exporting the 'getAllPosts' function
module.exports.getAllPosts = function () {
    // Returning a Promise for asynchronous handling
    return new Promise((resolve, reject) => {
        // Querying the database to find all posts
        Post.findAll().then(data => {
            // If data is retrieved successfully, resolve the Promise with the data
            resolve(data);
        }).catch(err => {
            // If an error occurs during the query, reject the Promise with an error message
            reject("No results returned");
        });
    });
};

// Exporting the 'getPublishedPosts' function
module.exports.getPublishedPosts = function () {
    // Returning a Promise for asynchronous handling
    return new Promise((resolve, reject) => {
        // Querying the database to find all published posts
        Post.findAll({
            where: {
                published: true
            }
        }).then(data => {
            // If published posts are retrieved successfully, resolve the Promise with the data
            resolve(data);
        }).catch(err => {
            // If an error occurs during the query, reject the Promise with an error message
            reject("No results returned");
        });
    });
};

// Exporting the 'getCategories' function
module.exports.getCategories = function () {
    // Returning a Promise for asynchronous handling
    return new Promise((resolve, reject) => {
        // Querying the database to find all categories
        Category.findAll().then(data => {
            // If categories are retrieved successfully, resolve the Promise with the data
            resolve(data);
        }).catch(err => {
            // If an error occurs during the query, reject the Promise with an error message
            reject("No results returned");
        });
    });
};

// Importing the 'Post' model
const Post = require('./models/post'); // Assuming the model is defined in './models/post'

// Exporting the 'addPost' function
module.exports.addPost = function (postData) {
    // Returning a Promise for asynchronous handling
    return new Promise((resolve, reject) => {
        // Convert 'published' property to boolean
        postData.published = (postData.published) ? true : false;

        // Iterate through postData properties and set empty strings to null
        for (var prop in postData) {
            if (postData[prop] === "") {
                postData[prop] = null;
            }
        }

        // Set postDate to the current date
        postData.postDate = new Date();

        // Creating a new post in the database using the 'Post' model
        Post.create({
            body: postData.body,
            title: postData.title,
            postDate: postData.postDate,
            featureImage: postData.featureImage,
            published: postData.published,
            category: postData.category
        }).then(data => {
            // If post creation is successful, resolve the Promise with the created data
            resolve(data);
        }).catch(err => {
            // If an error occurs during post creation, reject the Promise with an error message
            reject("Unable to create post");
        });
    });
};

module.exports.getPostsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                category: category
            }
        }).then(data=>{
            resolve(data);
        }).catch(err=>{
            reject("no results returned");
        });
    });
};

module.exports.getPostsByMinDate = function (minDateStr) {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;
        
        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        }).then(data=>{
            resolve(data);
        }).catch(err=>{
            reject("no results returned");
        });
    });
};

module.exports.getPostById = function (id) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                id: id
            }
        }).then(data=>{
            resolve(data[0]);
        }).catch(err=>{
            reject("no results returned");
        });
    });
};

module.exports.getPublishedPostsByCategory = function (category) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
                category: category
            }
        }).then(data=>{
            resolve(data);
        }).catch(err=>{
            reject("no results returned");
        });
    });
};

module.exports.addCategory = function (categoryData) {
    return new Promise((resolve, reject)=>{
        for (var prop in categoryData)
        {
            if (categoryData[prop] === "")
            {
                categoryData[prop] = null;
            }
        }

        Category.create({
            category: categoryData.category
        }).then(data=>{
            resolve(data);
        }).catch(err=>{
            reject("unable to create category");
        });
    });
}

module.exports.deleteCategoryById = function (id) {
    return new Promise((resolve, reject)=>{
        Category.destroy({
            where: {
                id: id
            }
        }).then(()=>{
            resolve();
        }).catch(err=>{
            reject();
        });
    });
}

module.exports.deletePostById = function (id) {
    return new Promise((resolve, reject)=>{
        Post.destroy({
            where: {
                id: id
            }
        }).then(()=>{
            resolve();
        }).catch(err=>{
            reject();
        });
    });
}