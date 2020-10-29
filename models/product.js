var mongoose=require('mongoose');

const productSchema=mongoose.Schema({
    name:{
        type: String,
        required: true,
        maxlength: 100
    },
    price:{
        type: Number,
        required: true,
        maxlength: 100
    },
    description:{
        type: String,
        required: true,
        maxlength: 100
    }
});

module.exports=mongoose.model('Product',productSchema);