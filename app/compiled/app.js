function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const React = window.React;
const {
  DragDropContext,
  Draggable,
  Droppable
} = window.ReactBeautifulDnd;
const ReactDOM = window.ReactDOM;

const getItemStyle = (draggableStyle, isDragging) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  height: 270,
  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'grey',
  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  padding: grid,
  minHeight: 620,
  minWidth: 320 // width: 250,
  // height: 650,

}); //
// Display stars below a business name.
//


class Stars extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      num: this.props.num || 3
    };
  }

  render() {
    var stars = parseFloat(this.state.num);
    var num = Math.floor(stars);
    var halfNeeded = stars - num == 0.5;
    var dummy = Array();

    for (var i = 1; i <= 5; i++) {
      if (i <= num) dummy.push("starOn");else if (i == num + 1 && halfNeeded) dummy.push("starHalf");else dummy.push("starOff");
    }

    var star = '\u2736'; // '\ufe61'; // '\u2b50'; // '\u2606';

    return React.createElement("div", {
      className: "stars_div"
    }, React.createElement("input", {
      type: "hidden",
      name: "stars",
      value: this.state.num
    }), dummy.map(function (key, i) {
      return React.createElement("span", {
        key: i,
        onClick: function () {
          this.setNum(i + 1);
        }.bind(this),
        className: key
      }, star);
    }.bind(this)));
  }

  setNum(i) {
    this.setState({
      num: i
    });
    var data = {
      proc: 'set_stars',
      review_id: this.props.review_id,
      value: i
    };
    jQuery.ajax({
      url: "set_textfield.php",
      data: data,
      cache: false,
      method: 'POST',
      type: 'POST',
      // For jQuery < 1.9
      success: function (data) {//  alert(data);
      }.bind(this)
    });
  }

}

class TextField extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      editing: this.props.editing || this.props.value == '',
      value: this.props.value
    };
  }

  componentDidUpdate() {// $(this.textFieldInput).focus();
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      editing: newProps.editing || this.props.value == ''
    });
  }

  submitChange() {
    var value = $(this.textFieldInput).val();
    if (value == null || value == '') value = $(this.textFieldInput).text();
    this.setState({
      value: value,
      editing: false
    });
    var data = {
      proc: "set_" + this.props.name,
      review_id: this.props.review_id,
      value: value
    };
    jQuery.ajax({
      url: "set_textfield.php",
      data: data,
      cache: false,
      method: 'POST',
      type: 'POST',
      // For jQuery < 1.9
      success: function (data) {//  alert(data);
      }.bind(this)
    });
  }

  onKeyDown(e) {
    if (e.keyCode == 13) {
      this.submitChange();
    }
  }

  renderReadOnly() {
    var url = "index.html?";
    url += this.props.name == 'place' ? 'place=' : 'item=';
    url += this.state.value;
    return React.createElement("div", {
      className: "textFieldDiv"
    }, React.createElement("a", {
      className: "textField",
      href: url
    }, this.state.value));
  }

  renderEdit() {
    return React.createElement("div", {
      className: "textFieldDivEditable"
    }, React.createElement("div", {
      className: "textField",
      contentEditable: "true",
      onBlur: this.submitChange.bind(this),
      type: "text",
      ref: ref => this.textFieldInput = ref,
      onKeyDown: this.onKeyDown.bind(this),
      placeholder: this.props.name,
      defaultValue: this.state.value
    }, this.state.value));
  }

  render() {
    if (this.state.editing) {
      return this.renderEdit();
    } else {
      return this.renderReadOnly();
    }
  }

}

class Photo extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      editing: this.props.editing || this.props.photo == '',
      photo: this.props.photo == '' ? "cloche.png" : this.props.photo
    };
  }

  setPreviewImage() {
    var oFReader = new FileReader();

    oFReader.onload = function (oFREvent) {
      var dataURI = oFREvent.target.result; // Show the image to be uploaded.

      $(this.previewImage).attr('src', dataURI);
      this.shrinkImage(oFREvent); // this.uploadImage();
    }.bind(this);

    oFReader.readAsDataURL($(this.uploaded_file).prop('files')[0]);
  }

  shrinkImage(readerEvent) {
    var image = new Image();

    image.onload = function (imageEvent) {
      // Resize the image
      var canvas = document.createElement('canvas'),
          max_size = 544,
          // TODO : pull max size from a site config
      width = image.width,
          height = image.height;

      if (width > height) {
        if (width > max_size) {
          height *= max_size / width;
          width = max_size;
        }
      } else {
        if (height > max_size) {
          width *= max_size / height;
          height = max_size;
        }
      }

      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(image, 0, 0, width, height);
      var dataUrl = canvas.toDataURL('image/jpeg');
      var resizedImage = this.dataURLToBlob(dataUrl);
      this.uploadResizedImage(resizedImage);
    }.bind(this);

    image.src = readerEvent.target.result;
  }

  dataURLToBlob(dataURL) {
    var BASE64_MARKER = ';base64,';

    if (dataURL.indexOf(BASE64_MARKER) == -1) {
      var parts = dataURL.split(',');
      var contentType = parts[0].split(':')[1];
      var raw = parts[1];
      return new Blob([raw], {
        type: contentType
      });
    }

    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;
    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {
      type: contentType
    });
  }

  uploadResizedImage(resizedImage) {
    var data = new FormData($("form[id*='upload_form']")[0]);

    if (resizedImage) {
      data.append('uploaded_file', resizedImage);
      $.ajax({
        url: 'set_photo.php',
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        method: 'POST',
        type: 'POST',
        success: function (data) {//handle errors...
          // alert ("success:  " + data);
        },
        error: function (data) {// alert ("error: " + data);
        }
      });
    }
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      editing: newProps.editing || this.props.value == ''
    });
  }

  renderReadOnly() {
    return React.createElement("img", {
      className: "photo_static",
      src: "/MyFavoriteThings/user_photos/" + this.state.photo,
      ref: ref => this.upload_form = ref
    });
  }

  renderEdit() {
    return React.createElement("form", {
      id: "upload_form",
      method: "post",
      encType: "multipart/form-data",
      target: "hiddenFrame",
      ref: ref => this.upload_form = ref
    }, React.createElement("label", null, React.createElement("img", {
      className: "photo_edit",
      src: "/MyFavoriteThings/user_photos/" + this.state.photo,
      ref: ref => this.previewImage = ref
    }), React.createElement("input", {
      type: "file",
      name: "uploaded_file",
      id: "uploaded_file",
      accept: "image/*",
      ref: ref => this.uploaded_file = ref,
      onChange: this.setPreviewImage.bind(this)
    }), React.createElement("input", {
      type: "hidden",
      name: "review_id",
      value: this.props.review_id
    })));
  }

  render() {
    if (this.state.editing) {
      return this.renderEdit();
    } else {
      return this.renderReadOnly();
    }
  }

}

class Review extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      editing: false,
      // this.props.editing,
      deleted: false,
      avg_delta: this.props.avg_delta,
      since_last: this.props.since_last,
      dragging: false
    };
  }

  delete_review() {
    jQuery.ajax({
      url: 'get.php',
      data: {
        'proc': 'delete_review',
        'param': this.props.review_id
      },
      dataType: 'text',
      cache: false,
      success: function (data) {
        this.setState({
          deleted: true
        });
      }.bind(this)
    });
  }

  log_review() {
    jQuery.ajax({
      url: 'get.php',
      data: {
        'proc': 'log_review',
        'param': this.props.review_id
      },
      dataType: 'text',
      cache: false,
      success: function (data) {
        window.location.reload(true);
        return; // Call parent's reload function.

        setTimeout(function () {
          this.props.reload();
        }.bind(this), 2000);
      }.bind(this)
    });
  }

  edit_review() {
    // Toggle.
    this.setState({
      editing: !this.state.editing
    });
  }

  buttons_static() {
    return React.createElement("span", null, React.createElement("button", {
      className: "edit_icon",
      onClick: this.edit_review.bind(this),
      title: "edit review"
    }, "edit"), React.createElement("button", {
      className: "log_icon",
      onClick: this.log_review.bind(this)
    }, "log"));
  }

  buttons_edit() {
    return React.createElement("span", null, React.createElement("button", {
      className: "edit_icon",
      onClick: this.edit_review.bind(this),
      title: "edit review"
    }, "done"), React.createElement("button", {
      className: "log_icon",
      onClick: this.log_review.bind(this)
    }, "log"));
  }

  format_delta(delta) {
    if (delta == null) return '';
    var minutes = parseInt(delta / 60.0);
    var hours = parseInt(minutes / 60.0);
    var days = parseInt(hours / 24.0);
    var minutes = minutes - days * 24 * 60;
    var hours = parseInt(minutes / 60.0);
    var minutes = minutes - hours * 60;
    var message = days + "d " + hours + "h " + minutes + "m";
    return message;
  }

  render() {
    var hue = this.props.freshness * 2;
    var saturation = 100 - this.props.freshness;
    var lightness = 50 + parseInt(this.props.freshness / 2.0);
    var hsl = "hsl(" + hue + "," + saturation + "%," + lightness + "%)";
    var style = {
      'backgroundColor': hsl
    };
    var buttons = this.state.editing ? this.buttons_edit() : this.buttons_static();
    var button_bar = this.props.freshness == null ? React.createElement("span", null) : React.createElement("div", {
      className: "button_holder",
      style: style
    }, buttons); //   var x = this.state.x;
    //   var y = this.state.y;

    var styleHeight = this.props.freshness == null ? {
      'height': '270px' // , 'left': x + 'px', 'top': y + 'px'}

    } : {
      'height': '316px'
    }; // , 'left': x + 'px', 'top': y + 'px'};

    if (this.state.deleted) {
      return React.createElement("div", null);
    } else {
      return React.createElement(Draggable, {
        draggableId: this.props.index,
        index: this.props.index
      }, (provided, snapshot) => React.createElement("div", _extends({
        className: "review",
        style: styleHeight,
        xstyle: getItemStyle(provided.draggableProps.style, snapshot.isDragging),
        ref: provided.innerRef
      }, provided.dragHandleProps, provided.draggableProps), React.createElement("button", {
        className: "delete_icon",
        onClick: this.delete_review.bind(this),
        title: "delete review"
      }, "X"), React.createElement(TextField, {
        review_id: this.props.review_id,
        value: this.props.place,
        editing: this.state.editing,
        name: "place"
      }), React.createElement(Stars, {
        review_id: this.props.review_id,
        num: this.props.stars,
        editing: this.props.editing
      }), React.createElement(Photo, {
        review_id: this.props.review_id,
        photo: this.props.photo,
        editing: this.state.editing
      }), React.createElement(TextField, {
        review_id: this.props.review_id,
        value: this.props.item,
        editing: this.state.editing,
        name: "item"
      }), button_bar, React.createElement("div", {
        className: "stats"
      }, React.createElement("div", {
        className: "since_last"
      }, this.format_delta(this.props.since_last)), React.createElement("div", {
        className: "last_time"
      }, this.props.last_time), React.createElement("div", {
        className: "avg_delta"
      }, this.format_delta(this.props.avg_delta)))));
    }
  }

}

const grid = 8;

class Column extends React.Component {
  render() {
    var isWeekend = this.props.dayOfWeek == 0 || this.props.dayOfWeek == 6;
    var style = {};

    if (isWeekend) {
      style = {
        'backgroundColor': '#AABBAA'
      };
    }

    if (this.props.dayOfWeek == 0) {
      style.clear = 'both';
    }

    var date = new Date(this.props.dateStr);
    var dayOfWeek = date.getDay();
    var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var today = dayNames[dayOfWeek];
    var month = monthNames[date.getMonth()];
    var dayOfMonth = date.getDate();
    return React.createElement("div", {
      className: "dayColumn",
      style: style
    }, today, React.createElement("br", null), month, " ", dayOfMonth, React.createElement(Droppable, {
      droppableId: this.props.dateStr
    }, (provided, snapshot) => React.createElement("div", null, React.createElement("div", _extends({
      style: getListStyle(snapshot.isDraggingOver)
    }, provided.droppableProps, {
      ref: provided.innerRef
    }), this.props.dayReviews), provided.placeholder)));
  }

} //           onDrop={(e)=>this.onDrop(e, key)}
//           onDragOver={(e)=>this.onDragOver(e)}


class Chron extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      reviews: [],
      place: this.props.place || '',
      item: this.props.item || ''
    };
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  reload() {
    var param = this.state.place + "','" + this.state.item;
    $.ajax({
      url: "get.php",
      data: {
        'proc': "get_log",
        "param": param
      },
      dataType: 'text',
      cache: false,
      success: function (dataStr) {
        var data = JSON.parse(dataStr);
        this.setState({
          reviews: data
        });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(status, err.toString());
      }
    });
  }

  componentDidMount() {
    this.reload(); //   $("#chron_holder").scrollLeft(-900);
  }

  setDate(log_id, date) {
    $.ajax({
      url: "get.php",
      data: {
        'proc': "set_date",
        "param": log_id + "','" + date
      },
      dataType: 'text',
      cache: false,
      success: function (dataStr) {}.bind(this),
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        alert("Status: " + textStatus);
        alert("Error: " + errorThrown);
      }
    });
  }

  createNewReview() {
    $.ajax({
      url: "get.php",
      data: {
        'proc': "create_new_review"
      },
      dataType: 'text',
      cache: false,
      success: function (dataStr) {
        var data = JSON.parse(dataStr);
        var newReviews = this.state.reviews;
        newReviews.push(data[0]);
        this.setState({
          reviews: newReviews
        });
      }.bind(this),
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        alert("Status: " + textStatus);
        alert("Error: " + errorThrown);
      }
    });
  }

  onDragStart(result) {
    console.log('OnDragStart');
  }

  onDragEnd(result) {
    if (!result.destination) {
      console.log("no destination");
      return;
    }

    console.log("onDragEnd: " + result.source.index + "_" + result.destination.index); // Change the date of this log item.

    var rev = this.state.reviews;
    rev[result.draggableId].date = result.destination.droppableId;
    this.setState({
      reviews: rev
    });
  }

  onDragOver(ev) {
    ev.preventDefault();
  }

  onDrop(ev, day) {
    let log_id = ev.dataTransfer.getData("log_id"); // Set the date of the review in this.state.   It will now move to the new column.

    var revs = this.state.reviews;
    revs.find(function (key, i) {
      if (key.log_id == log_id) {
        key.date = day; // Update just the date of the datetime string.

        key.datetime = day + ' ' + key.datetime.split(' ')[1];
        this.setDate(key.log_id, key.datetime);
        return day;
      }
    }.bind(this));
    this.setState({
      reviews: revs
    });
  }

  render() {
    var days = {};
    var dataDays = {};
    var allReviews = React.createElement("span", null); //
    // Define the calendar.
    //

    var maxDate = new Date("1900-01-01");
    var minDate = new Date("3000-01-01");
    this.state.reviews.sort((a, b) => b.date - a.date).map(function (row, i) {
      var theDate = new Date(row.date);
      maxDate = Math.max(maxDate, theDate);
      minDate = Math.min(minDate, theDate);

      if (!(row.date in dataDays)) {
        dataDays[row.date] = [];
      }

      dataDays[row.date].push(i);
    });
    minDate = new Date(minDate);
    maxDate = new Date(maxDate); // Move the start date to the previous Sunday, so the calendar looks good.

    minDate.setDate(minDate.getDate() - minDate.getDay()); // Move the date to tomorrow to make sure the loop finds today.

    maxDate.setDate(maxDate.getDate() + 1);

    for (var theDate = minDate; theDate <= maxDate; theDate.setDate(theDate.getDate() + 1)) {
      var dateString = theDate.toISOString().slice(0, 10);
      days[dateString] = []; // Add all reviews for this day

      if (dateString in dataDays) {
        dataDays[dateString].forEach(function (key, i) {
          days[dateString].push(key);
        });
      }
    } //
    // Output a day at a time.
    //


    var keys = Object.keys(days);

    if (keys.length > 0) {
      allReviews = keys.map(function (key, i) {
        var day = days[keys[i]]; // Go through all the reviews from this day.

        var dayReviews = day.map(function (_row, j) {
          if (_row in this.state.reviews) {
            var row = this.state.reviews[_row]; //          console.log("review key:" + row.review_id);

            return React.createElement(Review, {
              key: row.log_id,
              index: _row,
              review_id: row.review_id,
              place: row.place,
              item: row.item,
              photo: row.photo,
              stars: row.stars,
              avg_delta: row.avg_delta,
              since_last: row.since_last,
              date: row.last_day,
              last_time: row.last_time,
              last_day: row.last_day,
              reload: this.reload.bind(this),
              log_id: row.log_id
            });
          }
        }.bind(this));
        console.log("column key:" + keys[i]);
        return React.createElement(Column, {
          key: i,
          dateStr: keys[i],
          dayReviews: dayReviews
        });
      }.bind(this));
    }

    return React.createElement("div", null, React.createElement("button", {
      id: "newReviewButton",
      onClick: this.createNewReview.bind(this),
      title: "add review"
    }, React.createElement("span", {
      id: "new_review_button"
    }, "+")), React.createElement(DragDropContext, {
      onDragStart: this.onDragStart,
      onDragEnd: this.onDragEnd
    }, React.createElement("div", {
      id: "chron_holder"
    }, allReviews)));
  }

}

class Freshness extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      reviews: [],
      place: this.props.place || '',
      item: this.props.item || ''
    };
  }

  reload() {
    var param = this.state.place + "','" + this.state.item;
    $.ajax({
      url: "get.php",
      data: {
        'proc': "get_reviews",
        "param": param
      },
      dataType: 'text',
      cache: false,
      success: function (dataStr) {
        var data = JSON.parse(dataStr);
        this.setState({
          reviews: data
        });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(status, err.toString());
      }
    });
  }

  componentDidMount() {
    this.reload();
  }

  createNewReview() {
    $.ajax({
      url: "get.php",
      data: {
        'proc': "create_new_review"
      },
      dataType: 'text',
      cache: false,
      success: function (dataStr) {
        var data = JSON.parse(dataStr);
        var newReviews = this.state.reviews;
        newReviews.push(data[0]);
        this.setState({
          reviews: newReviews
        });
      }.bind(this),
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        alert("Status: " + textStatus);
        alert("Error: " + errorThrown);
      }
    });
  }

  render() {
    //   var maxWidth = 1200;
    //   var row = 0;
    var reviews = this.state.reviews.sort((a, b) => b.freshness - a.freshness).map(function (row, i) {
      return React.createElement(Review, {
        key: row.id,
        index: i,
        review_id: row.id,
        place: row.place,
        item: row.item,
        photo: row.photo,
        stars: row.stars,
        avg_delta: row.avg_delta,
        since_last: row.since_last,
        freshness: row.freshness || 0,
        last_time: row.last_time,
        reload: this.reload.bind(this)
      });
    }.bind(this));
    return React.createElement("div", null, React.createElement("button", {
      id: "newReviewButton",
      onClick: this.createNewReview.bind(this),
      title: "add review"
    }, React.createElement("span", {
      id: "new_review_button"
    }, "+")), React.createElement("div", {
      id: "freshness_holder"
    }, reviews));
  }

}

class MyPage extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      place: this.props.place || '',
      item: this.props.item || '',
      layout: 'chron'
    };
  }

  chronClick() {
    this.setState({
      layout: 'chron'
    });
  }

  freshnessClick() {
    this.setState({
      layout: 'freshness'
    });
  }

  render() {
    var reviews = this.state.layout == 'chron' ? React.createElement(Chron, {
      place: this.state.place,
      item: this.state.item
    }) : React.createElement(Freshness, {
      place: this.state.place,
      item: this.state.item
    });
    return React.createElement("div", null, React.createElement("div", {
      id: "title_bar"
    }, React.createElement("span", {
      id: "app_title"
    }, React.createElement("a", {
      href: "index.html"
    }, "My Favorite Things")), React.createElement("span", {
      id: "button_bar"
    }, React.createElement("button", {
      onClick: this.chronClick.bind(this)
    }, React.createElement("span", null, "chron")), React.createElement("button", {
      onClick: this.freshnessClick.bind(this)
    }, React.createElement("span", null, "fresh")))), React.createElement("div", null, reviews));
  }

}

function urlParam(name, defaultValue) {
  var s = decodeURI(window.location.search.replace("?", ""));
  var params = s.split("&");

  for (const param of params) {
    var pair = param.split("=");
    if (pair[0] == name) return pair[1];
  }

  return defaultValue;
}

class App extends React.Component {
  render() {
    var place = urlParam('place', '');
    var item = urlParam('item', '');
    return React.createElement(MyPage, {
      place: place,
      item: item
    });
  }

}

function renderRoot() {
  var domContainerNode = window.document.getElementById('root');
  ReactDOM.unmountComponentAtNode(domContainerNode);
  ReactDOM.render(React.createElement(App, null), domContainerNode);
}

$(document).ready(function () {
  renderRoot();
});