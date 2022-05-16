const BookModel = require("../models/bookModel")
const mongoose = require("mongoose")
const ReviewModel = require("../models/reviewModel")
const validateField = (field) => {
    return String(field).trim().match(
        /^[a-zA-Z0-9][a-zA-Z0-9\s\-,?_.]+$/);
};

const createBook = async (req, res) => {
    try {
        
        const data = req.body
        const userId = req.userId

        //check for empty body
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "please enter some DETAILS!!!" })
        }
        //title--------------------------------------------------------------------------------------------

        if (!data.title) {
            return res.status(400).send({ status: false, message: "TITLE is required!!!" })
        }
        if (!validateField(data.title)) {
            return res.status(400).send({ status: false, message: "format of title is wrong!!!" })
        }
        //check for unique title
        const title = await BookModel.findOne({ title: data.title })
        if (title) {
            return res.status(400).send({ status: false, message: "title already exist" })
        }

        //excerpt----------------------------------------------------------------------------------------
        if (!data.excerpt) {
            return res.status(400).send({ status: false, message: "EXCERPT is required!!!" })
        }
        if (!validateField(data.excerpt)) {
            return res.status(400).send({ status: false, message: "format of excerpt is wrong!!!" })
        }

        //userId------------------------------------------------------------------------------------------
        data.userId = userId

        //ISBN----------------------------------------------------------------------------------------------
        if (!data.ISBN) {
            return res.status(400).send({ status: false, message: "ISBN is required!!!" })
        }
        let validateISBN = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/
        if (!validateISBN.test(data.ISBN)) {
            return res.status(400).send({ status: false, message: "enter valid ISBN number" })
        }
        //check for unique ISBN
        const ISBN = await BookModel.findOne({ ISBN: data.ISBN })
        if (ISBN) {
            return res.status(400).send({ status: false, message: "ISBN already exist" })
        }


        //category-----------------------------------------------------------------------------------------
        if (!data.category) {
            return res.status(400).send({ status: false, message: "CATEGORY is required!!!" })
        }
        if (!validateField(data.category)) {
            return res.status(400).send({ status: false, message: "format of category is invalid!!!" })
        }

        //subcategory--------------------------------------------------------------------------------------

        if (!Array.isArray(data.subcategory)) {
            return res.status(400).send({ status: false, message: "SUBCATEGORY is type is invalid!!!" })
        }
        const filterArray = data.subcategory.filter((e) => e.trim().length != 0)
        data.subcategory = filterArray

        if (data.subcategory.length == 0) {
            return res.status(400).send({ status: false, message: "SUBCATEGORY cannot be empty!!!" })

        }


        //reviews-------------------------------------------------------------------------------------------
        // let reviews = data.reviews
        // if (reviews) {
        //     // if (!(reviews >= 0 && reviews <= 5)) {
        //   return res.status(400).send({ status: false, message: "rewiew rating is between 0 and 5!!!" })
        //     // }
        // }

        //deletedAt-------------------------------------------------------------------------------------------


        //releasedAt-----------------------------------------------------------------------------------------
        if (!data.releasedAt) {
            return res.status(400).send({ status: false, message: "RELEASED DATE is required!!!" })
        }
        let validateDate = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/gm
        if (!validateDate.test(data.releasedAt)) {
            return res.status(400).send({ status: false, message: "date must be in format  YYYY-MM-DD!!!" })

        }

        const book = await BookModel.create(data)
        return res.status(201).send({status:true , message:"Book created successfully" , data:book})
    }
    catch (err) {
       return res.status(500).send({ status: false, message: err.message })
    }
}





const getAllBooks = async (req, res) => {
    try {
        let data = req.query;
        let query = {};

        if(data.userId){
            query.userId=data.userId
        }
        if(data.category){
            query.category = data.category
        }
        if(data.subcategory){
            query.subcategory=data.subcategory
        }
        
        query.isDeleted = false;
        
        console.log(query)

        const allBooks = await BookModel.find(query).select({_id:1, title:1, excerpt:1, userId:1, category:1, releasedAt:1, reviews:1}).sort({title:1});
        
        if (allBooks.length == 0) {
            return res.status(404).send({
                status: false,
                message: "Book list not found"
            });
        }

        res.status(200).send({
            status: true,
            message: 'Books list',
            data: allBooks
        });
    } catch (err) {
        res.status(500).send({
            status: false,
            message: err.message
        });
    }
};


const getBooksById = async function (req, res) {
    try
    {
        let bookId  = req.params.bookId   //getting bookid from path params
        //let userId = req.userId
        if(!bookId){
            return res.status(400).send({status:false , message: "Please give book id"})
        }
        let isValidbookID = mongoose.Types.ObjectId.isValid(bookId);//check if objectId is objectid
        if (!isValidbookID) {
            return res.status(400).send({ status: false, message: "Book Id is Not Valid" });
        }

        const book = await BookModel.findOne({_id:bookId,isDeleted:false}).select({_v:0,ISBN:0})//check id exist in book model
        if (!book)
            return res.status(404).send({ status:false,message: "BookId dont exist" })

      
        //find because there can be many reviews------------------------------------------------------------------------
        const review = await ReviewModel.find({bookId:book.id, isDeleted:false}).select({isDeleted:0,createdAt:0,updatedAt:0,_v:0})

        let BookWithReview = JSON.parse(JSON.stringify(book))

        BookWithReview.reviewsData = review  //adding new review property inside book object

        return res.status(200).send({status:true, message : "Book Lists" , data:BookWithReview})
    }
    catch(err){
        return res.status(500).send({status:false , message:err.message})  
    }
}

const updateBook = async (req,res) => {
    try
    {
        let bookId  = req.params.bookId   //getting bookid from path params
        let userId = req.userId
        if(!bookId){
            return res.status(400).send({status:false , message: "Please give book id"})
        }
        let isValidbookID = mongoose.Types.ObjectId.isValid(bookId);//check if objectId is objectid
        if (!isValidbookID) {
            return res.status(400).send({ status: false, message: "Book Id is Not Valid" });
        }

        const book = await BookModel.findOne({_id:bookId,isDeleted:false})//check id exist in book model
        if (!book)
            return res.status(404).send({ status:false,message: "BookId dont exist" })

        //authorization-------------------------------------------------------------------------------
        if(book.userId!=userId){
            return res.status(403).send({status:false , message: "you cannot access others book data"})
        }

        let data = req.body
         //check for empty body
         if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "please enter some DETAILS!!!" })
        }

       
        //title--------------------------------------------------------------------------------------------

        if (data.title) {

            if (!validateField(data.title)) {
                return res.status(400).send({ status: false, message: "format of title is wrong!!!" })
            }
            //check for unique title
            const title = await BookModel.findOne({ title: data.title })
            if (title) {
                return res.status(400).send({ status: false, message: `title ${data.title} already taken ` })
            }
            book.title=data.title

        }

        //excerpt-----------------------------------------------------------------------------------------
        if (data.excerpt) {
            if (!validateField(data.excerpt)) {
                return res.status(400).send({ status: false, message: "format of excerpt is wrong!!!" })
            }

            book.excerpt=data.excerpt

        }

     //releasedAt-----------------------------------------------------------------------------------------
     if (data.releasedAt) {

         let validateDate = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/gm
         if (!validateDate.test(data.releasedAt)) {
             return res.status(400).send({ status: false, message: "date must be in format  YYYY-MM-DD or invalid!!!" })
            }
            book.releasedAt=data.releasedAt
    }

        //ISBN---------------------------------------------------------------------------------------------
        if (data.ISBN) {

            let validateISBN = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/
            if (!validateISBN.test(data.ISBN)) {
                return res.status(400).send({ status: false, message: "enter valid ISBN number" })
            }
            //check for unique ISBN
            const ISBN = await BookModel.findOne({ ISBN: data.ISBN })
            if (ISBN) {
                return res.status(400).send({ status: false, message: `ISBN number ${data.ISBN} already taken` })
            }

            book.ISBN=data.ISBN
        }
         book.save()
        return res.status(200).send({status:true, message:"updated book", data:book})


    }
    catch(err)
    {
        return res.status(500).send({status:false , message:err.message})  
    }
}






const deleteBooksById = async (req, res) => {
    try
    {
        let bookId  = req.params.bookId   //getting bookid from path params
        let userId = req.userId
        if(!bookId){
            return res.status(400).send({status:false , message: "Please give book id"})
        }

        let isValidbookID = mongoose.Types.ObjectId.isValid(bookId);//check if objectId is objectid
        if (!isValidbookID) {
            return res.status(400).send({ status: false, message: "Book Id is Not Valid" });
        }

        const book = await BookModel.findOne({_id:bookId,isDeleted:false})//check id exist in book model
        if (!book)
            return res.status(404).send({ status:false,message: "BookId dont exist" })

        //authorization-------------------------------------------------------------------------------
        if(book.userId!=userId){
            return res.status(403).send({status:false , message: "you cannot access others book data"})
        }

        //reviews of that particular book should also be deleted
        
        const review=await ReviewModel.updateMany({bookId:bookId,isDeleted:false} ,{ $set: {isDeleted:true}})
        
        book.isDeleted=true
        book.deletedAt=new Date()

        book.save()

        //matchedCount give us the count of how many documents are updated
        return res.status(200).send({status:true, message:"deleted book", deletedbook : `${book.title} book is deleted along with ${review.matchedCount} reviews`})
}
    catch(err){
        return res.status(500).send({status:false , message:err.message})  
    }
}







module.exports = { createBook ,getAllBooks , deleteBooksById, updateBook,getBooksById }
