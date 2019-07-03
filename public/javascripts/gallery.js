var photoManager;

var PhotoManager = {
	attachListeners: function() {
		var self = this;

		$('#slides + ul').off().on('click', 'a', self.slidePhoto.bind(self));
		$('.actions').off().on('click', 'a', self.increment.bind(self));
		$('form').off().on('submit', self.addComments.bind(self));
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

		this.prepareData(id);
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
			self.prepareData(id);
		})

		.fail(function(xhr, statusCode) {
			console.log(statusCode);
		});
	},

	prepareData: function(id) {
		this.populate(id);
		this.getComments(id);
		this.attachListeners()
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
			 console.log(json);
		})
	},

	increment: function(e) {
		e.preventDefault();
		var anchor = $(e.target);
		var path = anchor.attr('href');
		var id = anchor.attr('data-id');

		$.ajax({
			type: 'post',
			url: path,
			data: {photo_id: id},
		})

		.done(function(response) {
			var totalLikes = response.total;

			anchor.text(function(idx, text) {
				return text.replace(/\d+/, totalLikes);
			});
		});
	},

	addComments: function(e) {
		e.preventDefault();

		var $form = $(e.currentTarget);
		var $comments = $('#comments ul');
		var template = this.templates['comment'];

		$.ajax({
			type: $form.attr('method'),
			url: $form.attr('action'),
			data: $form.serializeArray(),
		})

		.done(function(json) {
			console.log(json);
			$comments.append(template(json));
			$form.trigger('reset');
		});
	},

	init: function(templates) {
		this.photos = null;
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
