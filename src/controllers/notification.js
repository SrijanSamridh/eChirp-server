const { NotificationType, NotificationLinkType } = require('../../utils/notification.utils');
const Group = require('../models/group.model.js');
const Notification = require('../models/notification.model.js');
const User = require('../models/user.models.js');
const Participant = require('../models/participant.model.js');

exports.sendNotification = async (req, res) => {
    try {
        let userId = req.user.id;
        let { groupId } = req.body;

        let user = await User.findOne({
            _id: userId
        });

        let group = await Group.findOne({
            _id: groupId
        });

        if (!group || !user) {
            return res.status(404).json({
                message: "Invalid request"
            });
        }

        await (new Notification({
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

        return res.status(200).json({
            message: "Notification sent"
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

        let notifications = await Notification.find({
            userId
        });

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
            let userId = notification.links.find(link => link.type === NotificationLinkType.USER).typeId;

            await (new Notification({
                userId,
                message: "Owner declined the request for " + groupName,
                type: NotificationType.DECLINED_GROUP_INVITE,
            })).save();

            return res.status(200).json({
                message: "Declined"
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

        await (new Notification({
            userId: user.typeId,
            message: "Owner accepted the request for " + group.link,
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
            message: "Accepted"
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}