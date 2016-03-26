const self = {
  port: {
    on: function(eventType, fn) {
      window.addEventListener.call(window, eventType, function(event) {
        fn(event.detail);
      });
    },
    emit: function(eventType, obj) {
      const event = new CustomEvent(eventType, {
        detail: obj,
      });
      window.dispatchEvent(event);
    },
  },
};
