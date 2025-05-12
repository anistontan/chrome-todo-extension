// State management
let tasks = [];
let calendarEvents = {};
let currentDate = new Date();
let selectedDate = null;
let currentEventIndex = -1; // Track which event is being edited

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Add cute sparkle stickers randomly
    addCuteElements();
    
    // Get DOM elements after DOM is loaded
    const taskList = document.getElementById('task-list');
    const newTaskInput = document.getElementById('new-task');
    const addTaskButton = document.getElementById('add-task');
    const clearAllButton = document.getElementById('clear-all');
    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthElement = document.getElementById('current-month');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Event details elements
    const eventDetailsSection = document.getElementById('event-details');
    const selectedDateElement = document.getElementById('selected-date');
    const eventsListElement = document.getElementById('events-list');
    const eventTitleInput = document.getElementById('event-title');
    const eventDescriptionInput = document.getElementById('event-description');
    const newEventButton = document.getElementById('new-event');
    const saveEventButton = document.getElementById('save-event');
    const deleteEventButton = document.getElementById('delete-event');
    const closeEventButton = document.getElementById('close-event');

    // Initialize
    loadTasks();
    loadCalendarEvents();

    // Add cute decorative elements
    function addCuteElements() {
        // Add some floating animations to cute elements
        const cuteElements = document.querySelectorAll('.cute-sticker');
        cuteElements.forEach(element => {
            element.classList.add('float');
        });
    }

    // Event Listeners
    function setupEventListeners() {
        // Tab switching
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                switchTab(tabName);
            });
        });

        // Task management
        addTaskButton.addEventListener('click', addTask);
        newTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });
        clearAllButton.addEventListener('click', clearAllTasks);

        // Calendar navigation
        prevMonthButton.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
        nextMonthButton.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
        
        // Event management
        newEventButton.addEventListener('click', createNewEvent);
        saveEventButton.addEventListener('click', saveEvent);
        deleteEventButton.addEventListener('click', deleteEvent);
        closeEventButton.addEventListener('click', closeEventDetails);
    }

    // Tab Management
    function switchTab(tabName) {
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });
        tabContents.forEach(content => {
            content.classList.toggle('hidden', content.id !== `${tabName}-section`);
        });
    }

    // Task Management
    function addTask() {
        const taskText = newTaskInput.value.trim();
        if (taskText) {
            const task = {
                id: Date.now(),
                text: taskText,
                completed: false,
                createdAt: new Date().toISOString()
            };
            tasks.push(task);
            saveTasks();
            renderTasks();
            newTaskInput.value = '';
            
            // Add a nice sparkle animation to the add button
            addTaskButton.classList.add('sparkle');
            setTimeout(() => addTaskButton.classList.remove('sparkle'), 600);
        }
    }

    function toggleTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }
    }

    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }

    function clearAllTasks() {
        if (confirm('Are you sure you want to clear all tasks?')) {
            tasks = [];
            saveTasks();
            renderTasks();
            
            // Add a nice sparkle animation to the button
            clearAllButton.classList.add('sparkle');
            setTimeout(() => clearAllButton.classList.remove('sparkle'), 600);
        }
    }

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            // Random slight rotation for scrapbook feel
            const rotation = Math.random() * 2 - 1; // Random between -1 and 1
            taskElement.style.transform = `rotate(${rotation}deg)`;
            
            taskElement.innerHTML = `
                <div class="flex items-center gap-2">
                    <button class="toggle-task text-pink-400 hover:text-pink-600">
                        ${task.completed ? '✓' : '○'}
                    </button>
                    <span class="task-text flex-1">${task.text}</span>
                    <button class="delete-task text-pink-400 hover:text-pink-600">×</button>
                </div>
            `;

            taskElement.querySelector('.toggle-task').addEventListener('click', () => {
                toggleTask(task.id);
                taskElement.classList.add('sparkle');
                setTimeout(() => taskElement.classList.remove('sparkle'), 600);
            });

            taskElement.querySelector('.delete-task').addEventListener('click', () => {
                deleteTask(task.id);
            });

            taskList.appendChild(taskElement);
        });
        
        // If there are no tasks, show a cute message
        if (tasks.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'text-center text-pink-300 py-4';
            emptyMessage.innerHTML = 'No tasks yet! <br>✨ Add something cute to do ✨';
            taskList.appendChild(emptyMessage);
        }
    }

    // Calendar Management
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        currentMonthElement.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();
        
        calendarGrid.innerHTML = '';
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day opacity-30';
            calendarGrid.appendChild(emptyDay);
        }
        
        // Add days of the month
        for (let day = 1; day <= totalDays; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            // Random slight rotation for scrapbook feel
            const rotation = Math.random() * 2 - 1; // Random between -1 and 1
            dayElement.style.transform = `rotate(${rotation}deg)`;
            
            const dateKey = formatDateKey(year, month, day);
            const isSelectedDate = selectedDate === dateKey;
            
            if (isSelectedDate) {
                dayElement.classList.add('selected');
            }
            
            if (calendarEvents[dateKey] && calendarEvents[dateKey].length > 0) {
                dayElement.classList.add('has-note');
                
                // Add dot indicators based on number of events (up to 3)
                const eventsCount = Math.min(calendarEvents[dateKey].length, 3);
                const dotsContainer = document.createElement('div');
                dotsContainer.className = 'flex gap-1 mt-1';
                
                for (let i = 0; i < eventsCount; i++) {
                    const dotElement = document.createElement('div');
                    dotElement.className = 'event-dot';
                    dotsContainer.appendChild(dotElement);
                }
                
                dayElement.appendChild(dotsContainer);
            }
            
            // Add day number
            const dayNumber = document.createElement('div');
            dayNumber.textContent = day;
            dayElement.appendChild(dayNumber);
            
            if (isToday(year, month, day)) {
                dayElement.classList.add('today');
            }
            
            dayElement.addEventListener('click', () => {
                selectDate(dateKey, year, month, day);
                dayElement.classList.add('sparkle');
                setTimeout(() => dayElement.classList.remove('sparkle'), 600);
            });
            
            calendarGrid.appendChild(dayElement);
        }
        
        // If a date was previously selected and is in this month, make sure we display it
        if (selectedDate) {
            const [selectedYear, selectedMonth] = selectedDate.split('-').map(Number);
            if (selectedYear === year && selectedMonth - 1 === month) {
                showEventsList(selectedDate);
            } else {
                closeEventDetails();
            }
        }
    }
    
    function selectDate(dateKey, year, month, day) {
        selectedDate = dateKey;
        
        // Update all calendar days to reflect the new selection
        document.querySelectorAll('.calendar-day').forEach(dayEl => {
            dayEl.classList.remove('selected');
        });
        
        // Find and mark the selected day
        const dayElements = Array.from(document.querySelectorAll('.calendar-day'));
        const offset = new Date(year, month, 1).getDay();
        const dayIndex = offset + day - 1;
        if (dayElements[dayIndex]) {
            dayElements[dayIndex].classList.add('selected');
        }
        
        showEventsList(dateKey);
    }
    
    function showEventsList(dateKey) {
        // Format the date for display
        const [year, month, day] = dateKey.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
        
        selectedDateElement.textContent = formattedDate;
        
        // Initialize if needed
        if (!calendarEvents[dateKey]) {
            calendarEvents[dateKey] = [];
        }
        
        // Render the list of events
        renderEventsList(dateKey);
        
        // Reset form for a new event
        createNewEvent();
        
        eventDetailsSection.classList.remove('hidden');
        // Add a nice reveal animation
        setTimeout(() => {
            eventDetailsSection.classList.add('sparkle');
            setTimeout(() => eventDetailsSection.classList.remove('sparkle'), 600);
        }, 50);
    }
    
    function renderEventsList(dateKey) {
        eventsListElement.innerHTML = '';
        
        if (!calendarEvents[dateKey] || calendarEvents[dateKey].length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'text-center text-pink-300 py-2';
            emptyMessage.innerHTML = 'No events yet! <br>✨ Add something special ✨';
            eventsListElement.appendChild(emptyMessage);
            return;
        }
        
        calendarEvents[dateKey].forEach((event, index) => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event-item';
            
            // Random slight rotation for scrapbook feel
            const rotation = Math.random() * 2 - 1; // Random between -1 and 1
            eventElement.style.transform = `rotate(${rotation}deg)`;
            
            const cuteEmoji = getRandomCuteEmoji();
            
            eventElement.innerHTML = `
                <div class="flex justify-between items-center">
                    <span class="font-medium">${event.title || 'Untitled Event'} ${cuteEmoji}</span>
                    <button class="edit-event">Edit</button>
                </div>
                ${event.description ? `<p class="text-sm text-gray-600 mt-1">${event.description}</p>` : ''}
            `;
            
            eventElement.querySelector('.edit-event').addEventListener('click', () => {
                editEvent(index);
                // Add a nice reveal animation
                eventElement.classList.add('sparkle');
                setTimeout(() => eventElement.classList.remove('sparkle'), 600);
            });
            
            eventsListElement.appendChild(eventElement);
        });
    }
    
    function getRandomCuteEmoji() {
        const emojis = ['✨', '🎀', '💕', '🌸', '🍓', '🌷', '🧁', '🎟️', '🩷'];
        return emojis[Math.floor(Math.random() * emojis.length)];
    }
    
    function createNewEvent() {
        // Reset the form for a new event
        currentEventIndex = -1;
        eventTitleInput.value = '';
        eventDescriptionInput.value = '';
        deleteEventButton.textContent = 'Clear All';
    }
    
    function editEvent(index) {
        if (!selectedDate || !calendarEvents[selectedDate]) return;
        
        const events = calendarEvents[selectedDate];
        if (index >= 0 && index < events.length) {
            const event = events[index];
            currentEventIndex = index;
            eventTitleInput.value = event.title || '';
            eventDescriptionInput.value = event.description || '';
            deleteEventButton.textContent = 'Delete';
        }
    }
    
    function closeEventDetails() {
        eventDetailsSection.classList.add('hidden');
        selectedDate = null;
        currentEventIndex = -1;
        
        // Remove selected class from all days
        document.querySelectorAll('.calendar-day').forEach(dayEl => {
            dayEl.classList.remove('selected');
        });
    }
    
    function saveEvent() {
        if (!selectedDate) return;
        
        const title = eventTitleInput.value.trim();
        const description = eventDescriptionInput.value.trim();
        
        // Ensure the events array exists
        if (!calendarEvents[selectedDate]) {
            calendarEvents[selectedDate] = [];
        }
        
        if (title || description) {
            const newEvent = {
                id: Date.now(),
                title,
                description
            };
            
            // If editing an existing event, update it
            if (currentEventIndex >= 0 && currentEventIndex < calendarEvents[selectedDate].length) {
                calendarEvents[selectedDate][currentEventIndex] = newEvent;
            } else {
                // Otherwise add a new event
                calendarEvents[selectedDate].push(newEvent);
            }
            
            saveCalendarEvents();
            renderCalendar();
            renderEventsList(selectedDate);
            
            // Add a nice sparkle animation to the save button
            saveEventButton.classList.add('sparkle');
            setTimeout(() => saveEventButton.classList.remove('sparkle'), 600);
            
            // Clear the form for a new event
            createNewEvent();
        }
    }
    
    function deleteEvent() {
        if (!selectedDate || !calendarEvents[selectedDate]) return;
        
        // If we're editing a specific event
        if (currentEventIndex >= 0 && currentEventIndex < calendarEvents[selectedDate].length) {
            if (confirm('Are you sure you want to delete this event?')) {
                calendarEvents[selectedDate].splice(currentEventIndex, 1);
                
                // If no events left for this date, remove the date entry
                if (calendarEvents[selectedDate].length === 0) {
                    delete calendarEvents[selectedDate];
                }
                
                saveCalendarEvents();
                renderCalendar();
                renderEventsList(selectedDate);
                
                // Add a nice sparkle animation to the delete button
                deleteEventButton.classList.add('sparkle');
                setTimeout(() => deleteEventButton.classList.remove('sparkle'), 600);
                
                // Clear the form
                createNewEvent();
            }
        } else if (calendarEvents[selectedDate].length > 0) {
            // If we're not editing a specific event but there are events on this date
            if (confirm('Are you sure you want to delete all events for this date?')) {
                delete calendarEvents[selectedDate];
                saveCalendarEvents();
                renderCalendar();
                renderEventsList(selectedDate);
                
                // Add a nice sparkle animation to the delete button  
                deleteEventButton.classList.add('sparkle');
                setTimeout(() => deleteEventButton.classList.remove('sparkle'), 600);
                
                // Clear the form
                createNewEvent();
            }
        }
    }
    
    function formatDateKey(year, month, day) {
        return `${year}-${month + 1}-${day}`;
    }

    function isToday(year, month, day) {
        const today = new Date();
        return today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day;
    }

    // Storage Management
    function saveTasks() {
        chrome.storage.local.set({ tasks });
    }

    function loadTasks() {
        chrome.storage.local.get(['tasks'], (result) => {
            tasks = result.tasks || [];
            renderTasks();
        });
    }

    function saveCalendarEvents() {
        chrome.storage.local.set({ calendarEvents });
    }

    function loadCalendarEvents() {
        chrome.storage.local.get(['calendarEvents'], (result) => {
            // Convert from old format if necessary
            const savedEvents = result.calendarEvents || {};
            
            // Check if events are in the old format (objects instead of arrays)
            Object.keys(savedEvents).forEach(dateKey => {
                if (!Array.isArray(savedEvents[dateKey])) {
                    const oldEvent = savedEvents[dateKey];
                    savedEvents[dateKey] = [{
                        id: Date.now(),
                        title: oldEvent.title || '',
                        description: oldEvent.description || ''
                    }];
                }
            });
            
            calendarEvents = savedEvents;
            renderCalendar();
        });
    }

    // Initialize
    setupEventListeners();
    renderTasks();
    renderCalendar();
}); 