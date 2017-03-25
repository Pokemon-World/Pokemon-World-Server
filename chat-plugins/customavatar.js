'use strict';

const fs = require('fs');
const path = require('path');
const request = require('request');

const AVATAR_PATH = path.join(__dirname, '../config/avatars/');

function download_image(image_url, name, extension) {
	request
		.get(image_url)
		.on('error', err => {
			console.error(err);
		})
		.on('response', response => {
			if (response.statusCode !== 200) return;
			const type = response.headers['content-type'].split('/');
			if (type[0] !== 'image') return;

			response.pipe(fs.createWriteStream(AVATAR_PATH + name + extension));
		});
}

function load_custom_avatars() {
	fs.readdir(AVATAR_PATH, (err, files) => {
		if (!files) files = [];
		files
			.filter(file => {
				return ['.jpg', '.png', '.gif'].indexOf(path.extname(file)) >= 0;
			})
			.forEach(file => {
				const name = path.basename(file, path.extname(file));
				Config.customavatars[name] = file;
			});
	});
}

load_custom_avatars();

function remove_custom_avatar(userid) {
	return new Promise((resolve, reject) => {
		if (!Config.customavatars[userid]) return resolve(); // nothing to do

		let image = Config.customavatars[userid];
		fs.unlink(AVATAR_PATH + image, err => {
			if (err && err.code === 'ENOENT') {
				reject();
			} else if (err) {
				console.error(err);
				reject();
			} else {
				// no problems!
				delete Config.customavatars[userid]; // delete from Config object
				resolve();
			}
		});
	})
}

exports.commands = {
	customavatar: {
		set: function (target, room, user) {
			if (!this.can('forcewin')) return false;

			const parts = target.split(',');

			if (parts.length < 2) return this.parse('/help customavatar');
			const name = toId(parts[0]);

			let image_url = parts[1];
			if (image_url.match(/^https?:\/\//i)) image_url = 'http://' + image_url;
			const ext = path.extname(image_url);

			if (!name || !image_url) return this.parse('/help customavatar');
			if (['.jpg', '.png', '.gif'].indexOf(ext) < 0) {
				return this.errorReply("Image url must have .jpg, .png, or .gif extension.");
			}
			remove_custom_avatar(name)
				.then(() => {
					Config.customavatars[name] = name + ext;

					download_image(image_url, name, ext);
					this.sendReply(parts[0] + "'s avatar has been set.");
					let targetUser = Users.get(name);
					if (targetUser) {
						targetUser.avatar = name + ext; // update the avatar in the user's user object for more immediate results.
						targetUser.popup(user.name + " has set your custom avatar. Refresh your page if you don\'t see it.");
					}
				})
				.catch(() => this.errorReply("Cannot remove the customavatar before setting it."));
		},

		delete: function (target, room, user) {
			if (!this.can('forcewin')) return false;

			const userid = toId(target);
			const image = Config.customavatars[userid];

			if (!image) {
				return this.errorReply("This user does not have a custom avatar");
			}

			remove_custom_avatar(userid)
				.then(() => {
					this.sendReply("Removed " + userid + "'s custom avatar.");
				})
				.catch(() => this.errorReply("Unable to remove the customavatar before setting it."));
		},

		'': 'help',
		help: function (target, room, user) {
			this.parse('/help customavatar');
		},
	},
	customavatarhelp: ["Commands for /customavatar are:",
	"/customavatar set [username], [image link] - Set a user's avatar.",
	"/customavatar delete [username] - Delete a user's avatar."],
};
