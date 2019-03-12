# MyFavoriteThings
# MyFavoriteThings

  onMouseDown(e) {
    this.pageX = e.pageX;
    this.pageY = e.pageY;
    this.setState({dragging: true});
  }

  onMouseUp(e) {
    this.setState({dragging: false});

    // Which div is closest?
  }

  onMouseMove(e) {
    if (this.state.dragging) {
      var dx = e.pageX - this.pageX;
      var dy = e.pageY - this.pageY;
      var x = this.state.x + dx;
      var y = this.state.y + dy;
      this.pageX = e.pageX;
      this.pageY = e.pageY;
      this.setState({'x':x, 'y':y});
      return false;
    }
  }
  
  
  
              onMouseUp={this.onMouseUp.bind(this)}
            onMouseMove={this.onMouseMove.bind(this)}
            onMouseDown={this.onMouseDown.bind(this)}