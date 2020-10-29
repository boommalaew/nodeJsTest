var mongoose=require('mongoose');

const orderSchema=mongoose.Schema({
    item:{
        type: Array,
        required: true
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
    },
    userid:{
        type: String,
        required: true,
        maxlength: 100
    },
    isactive:{
        type: Boolean,
        required: true
    }
});

module.exports=mongoose.model('Order',orderSchema);