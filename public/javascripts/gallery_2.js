var photoManager;

var PhotoManager = {
	attachListeners: function() {
		var self = this;

		$('#slides + ul').on('click', 'a', self.slidePhoto.bind(self));
	},

	slidePhoto: function(e) {
		e.preventDefault();

		var id = this.getVisiblePhotoId();
		var action = ($(e.target).attr('class'));

		this.fade({
			id: id,
			action: action,
		})
	},

	getVisiblePhotoId: function() {
		return Number($('#slides figure').filter(':visible').attr('data-id'));
	},

	fade: function(object) {
		var id = object.id;
		var action = object.action;
		var length = this.photos.length;

		$('figure[data-id=' + id + ']').fadeOut(600);

		switch (action) {
			case 'next':
				id++;
				break;
			case 'prev':
				id--;
				break;
		}

		if (id > length ) {
			id = 1;
		} else if (id < 1) {
			id = length;
		}

		this.populate(id);
		this.getComments(id);
		$('figure[data-id=' + id + ']').delay(600).fadeIn(600);
	},

	processPhotos: function() {
		var self = this;

		$.ajax({
			type: 'get',
			url: '/photos',
			dataType: 'json',
		})

		.done(function(json) {
			var id = 1;

			self.photos = json;
			self.renderPhotos({photos: self.photos});
			self.populate(id);
			self.getComments(id);
		})

		.fail(function(xhr, statusCode) {
			console.log(statusCode);
		});
	},

	renderPhotos: function(photos) {
		var $slides = $('#slides');
		var template = this.templates['photos'];

		$slides.append(template(photos));
	},

	populate: function(id) {
		var $photoInfo = $('section > header');
		var template = this.templates['photo_information'];

		var result = this.photos.filter(function(photo) {
			return photo.id === id;
		})[0];

		$photoInfo.html(template(result));
	},

	getComments(id) {
		var $comments = $('#comments ul');
		var template = this.templates['comments'];

		$.ajax({
			type: 'get',
			url: '/comments?photo_id=' + Number(id),
			dataType: 'json',
		})

		.done(function(json) {
			 $comments.html(template({comments: json}));
		})
	},

	init: function(templates) {
		this.photos = null;
		this.attachListeners();
		this.templates = templates;
		this.processPhotos();
		return this;
	}
}



$(function() {
	var templates = {};
	$('script[data-type="partial"]').each(function(idx) {
		Handlebars.registerPartial($(this).attr('id'), $(this).html());
	});

	$('script[type="text/x-handlebars"]').each(function(idx) {
		templates[$(this).attr('id')] = Handlebars.compile($(this).remove().html());
	});

	photoManager = Object.create(PhotoManager).init(templates);
})
