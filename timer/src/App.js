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
  constructor(props) {
    super(props);
    this.state = {
      timers: [
        {
          id: 1,
          title: "Timer 1",
          project: "Watch Twitch",
          elapsed: 278342,
          startTime: new Date(),
        },
        {
          id: 2,
          title: "Timer 2",
          project: "Learn React",
          elapsed: 6464124,
          startTime: null,
        },
        {
          id: 3,
          title: "Timer 3",
          project: "Recite Judge Dredd from memory",
          elapsed: 99999999999,
          startTime: null,
        },
      ]
    }
    this.updateTimer = this.updateTimer.bind(this);
    this.addTimer = this.addTimer.bind(this);
    this.deleteTimer = this.deleteTimer.bind(this);
    this.toggleTimer = this.toggleTimer.bind(this);
  }

  updateTimer(timer) {
    const newTimers = this.state.timers.map(t=>
      t.id === timer.id ? Object.assign({}, t, timer) : t);
    this.setState({timers: newTimers});
  }

  addTimer(timer) {
    const newId = Math.max.apply(null, this.state.timers.map(t=>t.id).concat(-1))+ 1;
    const newTimers = this.state.timers.concat(Object.assign({}, timer, {id: newId, elapsed: 0, startTime: null}));
    this.setState({timers: newTimers});
  }

  deleteTimer(id) {
    const newTimers = this.state.timers.filter(t => t.id !== id);
    this.setState({timers: newTimers});
  }

  toggleTimer(id) {
    this.setState({timers:
      this.state.timers.map(t=> {
        if(t.id === id) {
          let newTimer = Object.assign({}, t);
          if(newTimer.startTime === null)
            newTimer.startTime = new Date();
          else {
            const newElapsed = new Date() - newTimer.startTime;
            newTimer.elapsed += newElapsed;
            newTimer.startTime = null;
          }
          return newTimer;
        }
        else return t;
      })
    })
  }

  render() {
    return (
      <div className='ui three column centered grid'>
        <div className='column'>
          <TimerList 
            timers={this.state.timers} 
            updateFunc={this.updateTimer}
            deleteFunc={this.deleteTimer}
            toggleFunc={this.toggleTimer}
          />
          <TimerForm isOpen={false} updateFunc={this.addTimer} />
        </div>
      </div>
      );
  }
}

class TimerList extends Component {
  render() {
    return this.props.timers.map(t=>
      <Timer 
        key={t.id}
        timer={t}
        updateFunc={this.props.updateFunc}
        deleteFunc={this.props.deleteFunc}
        toggleFunc={this.props.toggleFunc}
      />
      );
  }
}

class TimerForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    };
    this.openForm = this.openForm.bind(this);
    this.closeForm = this.closeForm.bind(this);
  }
  openForm() {
    this.setState({isOpen: true});
  }
  closeForm() {
    this.setState({isOpen:false});
  }
  render() {
    if(this.state.isOpen)
      return <TimerEditor closeFunc={this.closeForm} updateFunc={this.props.updateFunc}/>;
    else
      return (
        <div className='ui basic content center aligned segment'>
          <button className='ui basic button icon' onClick={this.openForm}>
            <i className='plus icon' />
          </button>
        </div>
        );
  }
}

class Timer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    };
    this.openForm = this.openForm.bind(this);
    this.closeForm = this.closeForm.bind(this);
    this.toggleFunc = () => this.props.toggleFunc(this.props.timer.id);
  }
  openForm() {
    this.setState({isOpen: true});
  }
  closeForm() {
    this.setState({isOpen:false});
  }
  render() {
    if(this.state.isOpen)
      return <TimerEditor 
        id={this.props.timer.id}
        title={this.props.timer.title}
        project={this.props.timer.project}
        closeFunc={this.closeForm} 
        updateFunc={this.props.updateFunc} />;
    else
      return <TimerDisplay
        timer={this.props.timer}
        editFunc={this.openForm}
        deleteFunc={this.props.deleteFunc}
        toggleFunc={this.toggleFunc}
      />;
  }
}

class TimerEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: this.props.title || '',
      project: this.props.project || '',
    }
    this.updateTitle = this.updateTitle.bind(this);
    this.updateTimer = this.updateTimer.bind(this);
    this.updateProject = this.updateProject.bind(this);
  }

  updateTimer() {
    this.props.updateFunc({
      id: this.props.id,
      title: this.state.title,
      project: this.state.project,
    });
    this.props.closeFunc();
  }

  updateTitle(evt) {
    this.setState({title: evt.target.value || ''});
  }

  updateProject(evt) {
    this.setState({project: evt.target.value || ''});
  }

  render() {
    const submitText = this.props.id ? 'Update' : 'Create';
    return (
      <div className='ui centered card'>
        <div className='content'>
          <div className='ui form'>
            <div className='field'>
              <label>Title</label>
              <input type='text' defaultValue={this.props.title} onChange={this.updateTitle} />
            </div>
            <div className='field'>
              <label>Project</label>
              <input type='text' defaultValue={this.props.project} onChange={this.updateProject}/>
            </div>
            <div className='ui two bottom attached buttons'>
              <button className='ui basic blue button' onClick={this.updateTimer}>
                {submitText}
              </button>
              <button className='ui basic button red' onClick={this.props.closeFunc}>
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
  constructor(props) {
    super(props);
    this.deleteThis = this.deleteThis.bind(this);
  }

  deleteThis() {
    this.props.deleteFunc(this.props.id);
  }

  componentDidMount() {
    this.forceUpdateInterval = setInterval(()=>this.forceUpdate(), 50);
  }

  componentWillUnmount() {
    clearInterval(this.forceUpdateInterval);
  }

  render() {
    const timer = this.props.timer;
    let totalElapsed = timer.elapsed;
    if(timer.startTime != null)
    {
      const now = new Date();
      const currentElapsed = now - timer.startTime;
      totalElapsed += currentElapsed;
    }
    const elapsedString = helpers.renderTime(totalElapsed);
    return (
      <div className='ui centered card'>
        <div className='content'>
          <div className='header'>
            {this.props.timer.title}
          </div>
          <div className='meta'>
            {this.props.timer.project}
          </div>
          <div className='centered aligned description'>
            <h2>
              {elapsedString}
            </h2>
          </div>
          <div className='extra content'>
            <span className='right floated edit icon' onClick={this.props.editFunc}>
              <i className='edit icon' />
            </span>
            <span className='right floated trash icon' onClick={this.deleteThis}>
              <i className='trash icon' />
            </span>
          </div>
        </div>
        <TimerStartStop
          isRunning={this.props.timer.startTime !== null}
          toggleFunc={this.props.toggleFunc}
          />
      </div>
      );
  }
}

class TimerStartStop extends Component {
  render() {
    const color = this.props.isRunning ? 'red' : 'blue';
    const text = this.props.isRunning ? 'Stop' : 'Start';
    return (
        <div className={'ui bottom attached ' + color + ' basic button'} onClick={this.props.toggleFunc} >
          {text}
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