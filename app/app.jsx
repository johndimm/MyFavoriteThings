//
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
    var halfNeeded = (stars - num == 0.5);
    var dummy = Array();
    for (var i=1; i<=5; i++) {
      if (i <= num)
        dummy.push("starOn");
      else if (i == num + 1 && halfNeeded)
        dummy.push("starHalf");
      else
        dummy.push("starOff");
    }
    var star = '\u2736'; // '\ufe61'; // '\u2b50'; // '\u2606';
    return (
      <div className='stars_div'>
        <input type="hidden" name="stars" value={this.state.num} />
        {
          dummy.map(function(key, i) {
              return ( <span key={i} onClick={function() {this.setNum(i + 1)}.bind(this)} className={key}>{star}</span> );
           }.bind(this))
        }
      </div>
    );
  }

  setNum(i) {
    this.setState({num:i});
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
        type: 'POST', // For jQuery < 1.9
        success: function(data){
           //  alert(data);
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

  componentDidUpdate() {
     // $(this.textFieldInput).focus();
  }

  componentWillReceiveProps(newProps) {
    this.setState({editing: newProps.editing || this.props.value == ''});
  }

  submitChange() {
    var value = $(this.textFieldInput).val();
    if (value == null || value == '')
      value = $(this.textFieldInput).text();

    this.setState({value: value, editing:false});

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
        type: 'POST', // For jQuery < 1.9
        success: function(data){
           //  alert(data);
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
    return (
      <div className='textFieldDiv'>
        {<a className='textField' href={url}>{this.state.value}</a>}
      </div>
    )
  }

  renderEdit() {
    return (
        <div className="textFieldDivEditable">
          <div className='textField' contentEditable="true" onBlur={this.submitChange.bind(this)} type="text"
            ref={ref => this.textFieldInput = ref} onKeyDown={this.onKeyDown.bind(this)}
            placeholder={this.props.name} defaultValue={this.state.value} >{this.state.value}</div>
        </div>
    )
  }

  render() {
    if (this.state.editing) {
      return this.renderEdit()
    } else {
      return this.renderReadOnly()
    }
  }
}


class Photo extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      editing: this.props.editing || this.props.photo == '',
      photo:  this.props.photo == '' ? "cloche.png" : this.props.photo
    };
  }

  setPreviewImage() {
    var oFReader = new FileReader();

    oFReader.onload = function (oFREvent) {
        var dataURI = oFREvent.target.result;

        // Show the image to be uploaded.
        $(this.previewImage).attr('src', dataURI);

        this.shrinkImage(oFREvent);
         // this.uploadImage();
    }.bind(this);

    oFReader.readAsDataURL($(this.uploaded_file).prop('files')[0]);
  }

  shrinkImage(readerEvent) {
    var image = new Image();
    image.onload = function (imageEvent) {

        // Resize the image
        var canvas = document.createElement('canvas'),
            max_size = 544,// TODO : pull max size from a site config
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


  dataURLToBlob (dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = parts[1];

        return new Blob([raw], {type: contentType});
    }

    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: contentType});
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
            success: function(data){
               //handle errors...
               // alert ("success:  " + data);
            },
            error: function(data) {
              // alert ("error: " + data);
            }
        });
    }
  }


  componentWillReceiveProps(newProps) {
    this.setState({editing: newProps.editing || this.props.value == ''});
  }

  renderReadOnly() {
    return (
        <img className="photo_static" src={"/MyFavoriteThings/user_photos/" + this.state.photo}
          ref={ref => this.upload_form = ref}
        />
    )
  }

  renderEdit() {
    return (
         <form id="upload_form"
          method="post" encType="multipart/form-data"
          target="hiddenFrame"
          ref={ref => this.upload_form = ref}
          >
          <label>
                <img className="photo_edit" src={"/MyFavoriteThings/user_photos/" + this.state.photo}
                 ref={ref => this.previewImage = ref}
                  />
                <input type="file" name="uploaded_file" id="uploaded_file" accept="image/*"
                  ref={ref => this.uploaded_file = ref} onChange={this.setPreviewImage.bind(this)}/>
                <input type="hidden" name="review_id" value={this.props.review_id} />
          </label>
        </form>
    )
  }

  render() {
    if (this.state.editing) {
      return this.renderEdit()
    } else {
      return this.renderReadOnly()
    }
  }

}


class Review extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      editing: false, // this.props.editing,
      deleted: false,
      avg_delta: this.props.avg_delta,
      since_last: this.props.since_last
    };
  }

  delete_review() {
    jQuery.ajax({
        url: 'get.php',
        data: {'proc': 'delete_review', 'param': this.props.review_id},
        dataType: 'text',
        cache: false,
        success: function(data){
            this.setState({deleted: true});
        }.bind(this)
    });
  }

  log_review() {
    jQuery.ajax({
        url: 'get.php',
        data: {'proc': 'log_review', 'param': this.props.review_id},
        dataType: 'text',
        cache: false,
        success: function(data){
           window.location.reload(true);
           return;

           // Call parent's reload function.
           setTimeout(function() {
             this.props.reload()
           }.bind(this), 2000);
        }.bind(this)
    });
  }

  edit_review() {
    // Toggle.
    this.setState({editing: ! this.state.editing});
  }

  buttons_static() {
    return (
               <span>
                  <button className="edit_icon" onClick={this.edit_review.bind(this)} title="edit review">edit</button>
                  <button className="log_icon" onClick={this.log_review.bind(this)}>log</button>
              </span>
    )
  }

  buttons_edit() {
    return (
             <span>
                  <button className="edit_icon" onClick={this.edit_review.bind(this)} title="edit review">done</button>
                  <button className="log_icon" onClick={this.log_review.bind(this)}>log</button>
              </span>
    )
  }

  format_delta(delta) {
    if (delta == null)
      return '';

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
    var style = {'backgroundColor':hsl};

    var buttons = this.state.editing ? this.buttons_edit() : this.buttons_static();

    var button_bar = this.props.freshness == null
      ? ( <span></span> )
      : (
              <div className="button_holder" style={style}>
                {buttons}
              </div>
      )
    var styleHeight = this.props.freshness == null
      ? {'height':'270px'}
      : {'height':'316px'};

    if (this.state.deleted) {
      return (
        <div></div>
      )
    } else {
      return (
          <div className="review" style={styleHeight}>

              <button className="delete_icon" onClick={this.delete_review.bind(this)} title="delete review">X</button>

              <TextField review_id={this.props.review_id} value={this.props.place} editing={this.state.editing} name="place"/>
              <Stars review_id={this.props.review_id} num={this.props.stars} editing={this.props.editing} />
              <Photo review_id={this.props.review_id} photo={this.props.photo} editing={this.state.editing}/>
              <TextField review_id={this.props.review_id} value={this.props.item} editing={this.state.editing} name="item"/>
              {button_bar}
              <div className="stats">
                <div className="since_last">{this.format_delta(this.props.since_last)}</div>
                <div className="last_time">{this.props.last_time}</div>
                <div className="avg_delta">{this.format_delta(this.props.avg_delta)}</div>
              </div>
          </div>

      )
    }
  }
}


class Chron extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      reviews: [],
      place: this.props.place || '',
      item: this.props.item || '',
    };
  }


  reload() {
    var param = this.state.place + "','" + this.state.item;
    $.ajax({
      url: "get.php",
      data: {'proc':"get_log", "param": param },
      dataType: 'text',
      cache: false,
      success: function(dataStr) {
        var data = JSON.parse(dataStr);
        this.setState({reviews: data});
      }.bind(this),
      error: function(xhr, status, err) {
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
      data: {'proc': "create_new_review"},
      dataType: 'text',
      cache: false,
      success: function (dataStr) {
        var data = JSON.parse(dataStr);
        var newReviews = this.state.reviews;
        newReviews.push(data[0]);
        this.setState({reviews: newReviews});
      }.bind(this),
      error: function(XMLHttpRequest, textStatus, errorThrown) {
                    alert("Status: " + textStatus); alert("Error: " + errorThrown);
      }
    });

  }

  render() {
    var days = [];
    var allReviews = (<span></span>);

    this.state.reviews.sort((a,b) => b.date - a.date).map(function(row,i) {
         if (row.date != null) {
           var itsin = row.date in days;
           if (! (row.date in days)) {
             days[row.date] = [];
           }

           days[row.date].push(i);
         }
    }.bind(this));

    // Output a day at a time.
    var keys = Object.keys(days);
    if (keys.length > 0) {

    allReviews = keys.map( function(key, i)  {
       var day = days[keys[i]];

       // Go through all the reviews from this day.
       var dayReviews = day.map(function(_row,i) {
         var row = this.state.reviews[_row];
         return (
           <Review key={row.id}
                review_id={row.id}
                place={row.place}
                item={row.item}
                photo={row.photo}
                stars={row.stars}
                avg_delta={row.avg_delta}
                since_last={row.since_last}

                last_time={row.last_time}
                last_day={row.last_day}
                reload={this.reload.bind(this)}
                />
           )}.bind(this));

      return (
         <div className="dayColumn" key={key}>
         {keys[i]}
         <br />
         {dayReviews}
         </div>
      );

      }.bind(this));

    }
    return (
      <div>
            <button id="newReviewButton" onClick={this.createNewReview.bind(this)} title="add review">
               <span id='new_review_button'>+</span>
            </button>

        <div id="chron_holder">
          {allReviews}
        </div>

      </div>
    )
  }

}



class Freshness extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      reviews: [],
      place: this.props.place || '',
      item: this.props.item || '',
    };
  }

  reload() {
    var param = this.state.place + "','" + this.state.item;
    $.ajax({
      url: "get.php",
      data: {'proc':"get_reviews", "param": param },
      dataType: 'text',
      cache: false,
      success: function(dataStr) {
        var data = JSON.parse(dataStr);
        this.setState({reviews: data});
      }.bind(this),
      error: function(xhr, status, err) {
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
      data: {'proc': "create_new_review"},
      dataType: 'text',
      cache: false,
      success: function (dataStr) {
        var data = JSON.parse(dataStr);
        var newReviews = this.state.reviews;
        newReviews.push(data[0]);
        this.setState({reviews: newReviews});
      }.bind(this),
      error: function(XMLHttpRequest, textStatus, errorThrown) {
                    alert("Status: " + textStatus); alert("Error: " + errorThrown);
      }
    });

  }

  render() {
    var reviews = this.state.reviews.sort((a,b) => b.freshness - a.freshness).map(function(row,i) {
      return (
        <Review key={row.id}
                review_id={row.id}
                place={row.place}
                item={row.item}
                photo={row.photo}
                stars={row.stars}
                avg_delta={row.avg_delta}
                since_last={row.since_last}
                freshness={row.freshness || 0}
                last_time={row.last_time}
                reload={this.reload.bind(this)}
                />
      )
    }.bind(this));

    return (
      <div>
            <button id="newReviewButton" onClick={this.createNewReview.bind(this)} title="add review">
               <span id='new_review_button'>+</span>
            </button>

        <div id="freshness_holder">
          {reviews}
        </div>

      </div>
    );
  }
}


class MyPage extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      place: this.props.place || '',
      item: this.props.item || '',
      layout: 'freshness'
    };
  }

  chronClick() {
    this.setState({layout: 'chron'});
  }

  freshnessClick() {
    this.setState({layout: 'freshness'});
  }

  render() {
    var reviews = this.state.layout == 'chron'
      ? ( <Chron place={this.state.place} item={this.state.item} /> )
      : ( <Freshness place={this.state.place} item={this.state.item} /> )

    return (
      <div>

        <div id="title_bar">
          <span id='app_title'>
            <a href="index.html">My Favorite Things</a>
          </span>
          <span id="button_bar">
            <button onClick={this.chronClick.bind(this)}><span>chron</span></button>
            <button onClick={this.freshnessClick.bind(this)}><span>fresh</span></button>
          </span>
        </div>

        <div>
         {reviews}
       </div>

     </div>
    )
  }
}


function urlParam(name, defaultValue) {
  var s = decodeURI(window.location.search.replace("?",""));
  var params = s.split("&");
  for (const param of params) {
    var pair = param.split("=");
    if (pair[0] == name)
      return pair[1];
  }
  return defaultValue;
}


class App extends React.Component {
  render() {
    var place = urlParam('place', '');
    var item = urlParam('item', '');
    return (
       <MyPage place={place} item={item}/>
    );
  }
}



function renderRoot() {
  var domContainerNode = window.document.getElementById('root');
  ReactDOM.unmountComponentAtNode(domContainerNode);
  ReactDOM.render(<App />, domContainerNode);

}


$(document).ready (function() {
  renderRoot();
});
