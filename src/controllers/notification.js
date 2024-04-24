const { NotificationType, NotificationLinkType } = require('../../utils/notification.utils');
const Group = require('../models/group.model.js');
const Notification = require('../models/notification.model.js');
const User = require('../models/user.models.js');
const Participant = require('../models/participant.model.js');
const mongoose = require('mongoose');
const io = require('../../config/socket.js');

exports.sendNotification = async (req, res) => {
    try {
        let userId = req.user.id;
        let { groupId } = req.body;

        let user = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "participants",
                    localField: "_id",
                    foreignField: "userId",
                    pipeline: [
                        {
                            $match: {
                                groupId: new mongoose.Types.ObjectId(groupId)
                            }
                        }
                    ],
                    as: "participants"
                }
            }
        ]);

        if (!user || user.length === 0) {
            return res.status(404).json({
                message: "Invalid request"
            });
        }

        user = user[0];

        if (user.participants.length > 0) {
            return res.status(400).json({
                message: "You are already a member of this group"
            });
        }

        let group = await Group.findOne({
            _id: groupId
        });

        if (!group || !user) {
            return res.status(404).json({
                message: "Invalid request"
            });
        }

        let data = await (new Notification({
            userId: group.owner,
            message: user.username + " have requested to join " + group.name,
            type: NotificationType.INCOMING_GROUP_INVITE,
            links: [
                {
                    start: 0,
                    end: user.username.length,
                    link: user.username,
                    type: NotificationLinkType.USER,
                    typeId: userId
                },
                {
                    start: 27,
                    end: 27 + group.name.length,
                    link: group.name,
                    type: NotificationLinkType.GROUP,
                    typeId: groupId
                }
            ]
        })).save();

        let dataToSend = {
            notificationId: data._id,
            userId: data.userId,
            message: data.message,
            type: data.type,
            links: data.links,
            createdAt: data.createdAt
        }

        return res.status(200).json({
            message: "Notification sent",
            notification: dataToSend
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

exports.getNotifications = async (req, res) => {
    try {
        let userId = req.user.id;

        let notifications = await Notification.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $project: {
                    _id: 0,
                    notificationId: "$_id",
                    userId: 1,
                    message: 1,
                    type: 1,
                    links: 1,
                    createdAt: 1
                }
            }
        ]);

        return res.status(200).json({
            notifications
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

exports.replyToNotification = async (req, res) => {
    try {
        let userId = req.user.id;
        let { notificationId, reply } = req.body;

        if (!reply) {
            return res.status(400).json({
                message: "Invalid request"
            });
        }

        if (reply === "decline") {
            let notification = await Notification.findByIdAndDelete({ _id: notificationId, userId });
            if(notification.type !== NotificationType.INCOMING_GROUP_INVITE) {
                return res.status(400).json({
                    message: "Invalid request"
                });
            }
            let groupName = notification.links.find(link => link.type === NotificationLinkType.GROUP).link;
            let user = notification.links.find(link => link.type === NotificationLinkType.USER);

            let data = await (new Notification({
                userId: user.typeId,
                message: "Owner declined the request for " + groupName,
                type: NotificationType.DECLINED_GROUP_INVITE,
            })).save();

            return res.status(200).json({
                message: "Declined",
                notification: {
                    notificationId: data._id,
                    userId: data.userId,
                    message: data.message,
                    links: data.links,
                    type: data.type,
                    createdAt: data.createdAt
                }
            });
        }

        if (reply !== "accept") {
            return res.status(400).json({
                message: "Invalid request"
            });
        }

        let notification = await Notification.findOne({ _id: notificationId });
        if(notification.type !== NotificationType.INCOMING_GROUP_INVITE) {
            return res.status(400).json({
                message: "Invalid request"
            });
        }
        let group = notification.links.find(link => link.type === NotificationLinkType.GROUP);
        let user = notification.links.find(link => link.type === NotificationLinkType.USER);

        await Participant.insertMany([{
            userId: user.typeId,
            groupId: group.typeId,
            isAdmin: false
        }]);

        let data = await (new Notification({
            userId: user.typeId,
            message: "Owner accepted the request for " + group.link,
            links: [
                {
                    start: 24,
                    end: 24 + group.link.length,
                    link: group.link,
                    type: NotificationLinkType.GROUP,
                    typeId: group.typeId
                }
            ],
            type: NotificationType.ACCEPTED_GROUP_INVITE
        })).save();

        await Notification.updateOne({
            _id: notificationId
        }, {
            $set: {
                message: "You have accepted the request of " + user.link,
                type: NotificationType.ACCEPTED_GROUP_INVITE
            }
        });

        return res.status(200).json({
            message: "Accepted",
            notification: {
                notificationId: data._id,
                userId: data.userId,
                message: data.message,
                links: data.links,
                type: data.type,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}