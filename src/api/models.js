import mongoose from "mongoose"

const {Schema, model} = mongoose

const experienceSchema = new Schema(
    {
        role: {type: String, required: true},
        company: {type: String, required: true},
        startDate: {type: Date, required: true},
        endDate: {type: Date},
        description: {type: String, required: true},
        area: {type: String, required: true},
        image: {default: "https://picsum.photos/300/300", type: String, required: true}
    },
    {
        timestamps: true
    }
)
