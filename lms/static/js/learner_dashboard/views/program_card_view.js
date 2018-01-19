/* globals gettext */

import 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import picturefill from 'picturefill';

import programCardTpl from '../../../templates/learner_dashboard/program_card.underscore';

class ProgramCardView extends Backbone.View {
  constructor(options) {
    const defaults = {
      className: 'program-card',
      attributes: () => ({
        'aria-labelledby': `program-${this.model.get('uuid')}`,
        role: 'group',
      }),
    };
    super(Object.assign({}, defaults, options));
  }

  initialize(data) {
    this.tpl = _.template(programCardTpl);
    this.progressCollection = data.context.progressCollection;
    if (this.progressCollection) {
      this.progressModel = this.progressCollection.findWhere({
        uuid: this.model.get('uuid'),
      });
    }
    this.render();
  }

  render() {
    const orgList = _.map(this.model.get('authoring_organizations'), org => gettext(org.key));
    const data = $.extend(
      this.model.toJSON(),
      this.getProgramProgress(),
      { orgList: orgList.join(' ') },
    );

    this.$el.html(this.tpl(data));
    this.postRender();
  }

  postRender() {
    if (navigator.userAgent.indexOf('MSIE') !== -1 ||
        navigator.appVersion.indexOf('Trident/') > 0) {
      /* Microsoft Internet Explorer detected in. */
      window.setTimeout(() => {
        this.reLoadBannerImage();
      }, 100);
    }
  }

  // Calculate counts for progress and percentages for styling
  getProgramProgress() {
    const progress = this.progressModel ? this.progressModel.toJSON() : false;

    if (progress) {
      progress.total = progress.completed +
        progress.in_progress +
        progress.not_started;

      progress.percentage = {
        completed: this.getWidth(progress.completed, progress.total),
        in_progress: this.getWidth(progress.in_progress, progress.total),
      };
    }

    return {
      progress,
    };
  }

  static getWidth(val, total) {
    const int = (val / total) * 100;
    return `${int}%`;
  }

  // Defer loading the rest of the page to limit FOUC
  reLoadBannerImage() {
    const $img = this.$('.program_card .banner-image');
    const imgSrcAttr = $img ? $img.attr('src') : {};

    if (!imgSrcAttr || imgSrcAttr.length < 0) {
      try {
        this.reEvaluatePicture();
      } catch (err) {
        // Swallow the error here
      }
    }
  }

  static reEvaluatePicture() {
    picturefill({
      reevaluate: true,
    });
  }
}

export { ProgramCardView as default };
