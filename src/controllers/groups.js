const mongoose = require('mongoose');
const Group = require('../models/group.model.js');
const Participant = require('../models/participant.model.js');
const User = require('../models/user.models.js');
const { Categories } = require('../../utils/categories.utils.js');

exports.createGroup = async (req, res) => {
    try {
        const { name, description, participants = [], category, subCategory, subSubCategory } = req.body;
        const owner = req.user.id;
        let user = await User.findOne({ _id: owner });

        if (!Object(Categories).hasOwnProperty(category) || (subCategory && !Categories[category].hasOwnProperty(subCategory)) || (subSubCategory && !Array(Categories[category][subCategory]).includes(subSubCategory))) {
            return res.status(400).json({ message: "Invalid category" });
        }

        let data = await (new Group({
            name,
            description,
            owner,
            category,
            subCategory,
            subSubCategory
        })).save();

        await Participant.insertMany([...participants.map((item) => {
            if (item._id === req.user.id) return;
            return {
                userId: item._id,
                groupId: data._id
            }
        }), { userId: owner, groupId: data._id, isAdmin: true, isOwner: true }]);

        await Group.updateOne({ _id: data._id }, { $set: { participants: participants.length + 1 } });

        let group = {
            groupId: data._id,
            name: data.name,
            description: data.description,
            category: data.category,
            subCategory: data.subCategory,
            subSubCategory: data.subSubCategory,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            owner: {
                _id: user._id,
                username: user.username,
                email: user.email,
                owned: true
            },
            participants: [...participants.map((item) => {
                return {
                    userId: item.userId,
                }
            }), {
                userId: owner
            }],
            lastMessage: []
        }

        res.status(201).json({ message: "Group created successfully", group });
    } catch (err) {
        res.status(500).json({ message: "Internal server error", err });
    }
}

exports.getGroups = async (req, res) => {
    try {
        let type = req.query.type;
        let search;
        if (type && (type === "owned")) {
            search = {
                userId: new mongoose.Types.ObjectId(req.user.id),
                isAdmin: true,
                isOwner: true
            }
        } else if (type && (type === "joined")) {
            search = {
                userId: new mongoose.Types.ObjectId(req.user.id),
                isOwner: {
                    $ne: true
                }
            }
        } else {
            search = {
                userId: new mongoose.Types.ObjectId(req.user.id)
            }
        }
        let groups = await Participant.aggregate([
            {
                $match: search
            },
            {
                $lookup: {
                    from: "groups",
                    localField: "groupId",
                    foreignField: "_id",
                    as: "group"
                }
            },
            {
                $unwind: "$group"
            },
            {
                $lookup: {
                    from: "users",
                    localField: "group.owner",
                    foreignField: "_id",
                    let: {
                        "owner_id": "$group.owner",
                    },
                    pipeline: [
                        {
                            $project: {
                                "_id": 1,
                                "username": 1,
                                "email": 1,
                                "owned": {
                                    $cond: {
                                        if: {
                                            $eq: [new mongoose.Types.ObjectId(req.user.id), "$$owner_id"]
                                        },
                                        then: true,
                                        else: false
                                    }
                                }
                            }
                        }
                    ],
                    as: "owner"
                }
            },
            {
                $unwind: "$owner"
            },
            {
                $lookup: {
                    from: "participants",
                    localField: "group._id",
                    foreignField: "groupId",
                    pipeline: [
                        {
                            $project: {
                                "_id": 0,
                                "userId": "$userId"
                            }
                        }
                    ],
                    as: "participants"
                }
            },
            {
                $lookup: {
                    from: "messages",
                    localField: "groupId",
                    foreignField: "groupId",
                    pipeline: [
                        {
                            $sort: {
                                createdAt: -1
                            }
                        },
                        {
                            $limit: 1
                        }
                    ],
                    as: "lastMessage"
                }
            },
            {
                $project: {
                    "groupId": "$group._id",
                    "name": "$group.name",
                    "description": "$group.description",
                    "createdAt": "$group.createdAt",
                    "category": "$group.category",
                    "subCategory": "$group.subCategory",
                    "subSubCategory": "$group.subSubCategory",
                    "owner": "$owner",
                    "participants": "$participants",
                    "lastMessage": "$lastMessage"
                }
            }
        ]);

        return res.status(200).json({ groups });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.updateGroup = async (req, res) => {
    try {
        let { groupId, name, description } = req.body;

        let data = await Participant.findOne({ groupId, userId: req.user.id });

        if (!data || !data.isAdmin) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        await Group.updateOne({ _id: groupId }, { $set: { name, description } });

        res.status(200).json({ message: "Group updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.getUnknownGroups = async (req, res) => {
    try {
        let groups = await Group.aggregate([
            {
                $lookup: {
                    from: "participants",
                    localField: "_id",
                    foreignField: "groupId",
                    pipeline: [
                        {
                            $project: {
                                "_id": 0,
                                "userId": "$userId"
                            }
                        }
                    ],
                    as: "participants"
                }
            },
            {
                $match: {
                    "participants.userId": {
                        $ne: new mongoose.Types.ObjectId(req.user.id)
                    }
                }
            },
            {
                $lookup: {
                    from: "messages",
                    localField: "_id",
                    foreignField: "groupId",
                    pipeline: [
                        {
                            $sort: {
                                createdAt: -1
                            }
                        },
                        {
                            $limit: 1
                        }
                    ],
                    as: "lastMessage"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    let: {
                        "owner_id": "$group.owner",
                    },
                    pipeline: [
                        {
                            $project: {
                                "_id": 1,
                                "username": 1,
                                "email": 1,
                                "owned": {
                                    $cond: {
                                        if: {
                                            $eq: [new mongoose.Types.ObjectId(req.user.id), "$$owner_id"]
                                        },
                                        then: true,
                                        else: false
                                    }
                                }
                            }
                        }
                    ],
                    as: "owner"
                }
            },
            {
                $project: {
                    "groupId": "$_id",
                    "name": "$name",
                    "description": "$description",
                    "createdAt": "$createdAt",
                    "category": "$category",
                    "subCategory": "$subCategory",
                    "subSubCategory": "$subSubCategory",
                    "owner": "$owner",
                    "participants": "$participants",
                    "lastMessage": "$lastMessage"
                }
            }
        ]);

        res.status(200).json({ groups });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
}