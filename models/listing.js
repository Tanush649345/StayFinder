const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    description:String,
    image:{
        url:{
            type:String,
            default :"https://images.openai.com/static-rsc-4/86b96_aASiNtYL3MznDpR9xk5KFVGwJoDI3wBILkflUVs7FLYyEAoLD2F-4tYvI6yQlkhlCWi7bPXX4VFDcuFxYxJ0ygGg1AeChEfWa53PIHnozZpnKG48KtCo0YismKh0hksSMIFLL_mm4nTI7ynizJvfRFkpa3l0GeuDWCMTd-UpugAIxKSZEPtz-dodjG?purpose=fullsize",
            set: (v)=> 
                v === ""
            ? "https://images.openai.com/static-rsc-4/86b96_aASiNtYL3MznDpR9xk5KFVGwJoDI3wBILkflUVs7FLYyEAoLD2F-4tYvI6yQlkhlCWi7bPXX4VFDcuFxYxJ0ygGg1AeChEfWa53PIHnozZpnKG48KtCo0YismKh0hksSMIFLL_mm4nTI7ynizJvfRFkpa3l0GeuDWCMTd-UpugAIxKSZEPtz-dodjG?purpose=fullsize" 
            : v,
        },
        filename:String,

        
    },
    price: Number,
    location:String,
    country:String,
    reviews:[
        {
        type:Schema.Types.ObjectId,
        ref:"Review",
        },
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    geometry:{
            type: {
                type: String, // Don't do `{ location: { type: String } }`
                enum: ['Point'], // 'location.type' must be 'Point'
                required: true
            },
        coordinates: {
            type: [Number],
            required: true
        }
    }
});

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id : {$in : listing.reviews}});
    }
});

const Listing = mongoose.model("Listing",listingSchema);

module.exports = Listing;
 