import React, { Component } from 'react';
import './App.css';

class App extends Component {
  render() {
    return (
      <TimerDashboard />
    );
  }
}

class TimerDashboard extends Component {
  render() {
    return (
      <div className='ui three column centered grid'>
        <div className='column'>
          <TimerList />
          <TimerForm isOpen={false} />
        </div>
      </div>
      );
  }
}

class TimerList extends Component {
  render() {
    return ["#ff0000", "#00ff00", "#0000ff"].map((c,k) => <Timer title={c} project={k} editing={k%2 === 0} />);
  }
}

class TimerForm extends Component {
  render() {
    if(this.props.isOpen)
      return <TimerEditor />;
    else
      return (
        <div className='ui basic content center aligned segment'>
          <button className='ui basic button icon'>
            <i className='plus icon' />
          </button>
        </div>
        );
  }
}

class Timer extends Component {
  render() {
    if(this.props.editing)
      return <TimerEditor title={this.props.title} project={this.props.project}/>;
    else
      return <TimerDisplay 
                title={this.props.title}
                project={this.props.project}
                elapsed={209382}
              />;
  }
}

class TimerEditor extends Component {
  render() {
    const submitText = this.props.title ? 'Update' : 'Create';
    return (
      <div className='ui centered card'>
        <div className='content'>
          <div className='ui form'>
            <div className='field'>
              <label>Title</label>
              <input type='text' defaultValue={this.props.title} />
            </div>
            <div className='field'>
              <label>Project</label>
              <input type='text' defaultValue={this.props.project} />
            </div>
            <div className='ui two bottom attached buttons'>
              <button className='ui basic blue button'>
                {submitText}
              </button>
              <button className='ui basic button red'>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      );
  }
}

class TimerDisplay extends Component {
  render() {
    const elapsedString = helpers.renderTime(this.props.elapsed);
    return (
      <div className='ui centered card'>
        <div className='content'>
          <div className='header'>
            {this.props.title}
          </div>
          <div className='meta'>
            {this.props.project}
          </div>
          <div className='centered aligned description'>
            <h2>
              {elapsedString}
            </h2>
          </div>
          <div className='extra content'>
            <span className='right floated edit icon'>
              <i className='edit icon' />
            </span>
            <span className='right floated trash icon'>
              <i className='trash icon' />
            </span>
          </div>
        </div>
        <div className='ui bottom attached blue basic button'>
          Start
        </div>
      </div>
      );
  }
}

const helpers = {renderTime: (duration) => {
  let milliseconds = parseInt((duration % 1000) / 100),
    seconds = parseInt((duration / 1000) % 60),
    minutes = parseInt((duration / (1000 * 60)) % 60),
    hours = parseInt((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
} 
};

export default App;