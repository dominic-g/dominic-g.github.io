angular.module('ToDoApp', [])
      .controller('ToDoController', function($scope, $interval) {
        var storage = window.localStorage || window.sessionStorage;
        $scope.tasks = JSON.parse(storage.getItem('tasks')) || [];

        $scope.addTask = function() {
          if ($scope.newTask.title && $scope.newTask.deadline) {
            var deadline = new Date($scope.newTask.deadline);
            var createdDate = new Date();

            var task = {
              id: Date.now(), // Unique identifier for the task
              title: $scope.newTask.title,
              deadline: deadline,
              createdDate: createdDate,
              completed: false,
              status: '',
              notified: false
            };

            if (deadline > createdDate) {
              task.status = 'scheduled';
            } else if (deadline < createdDate) {
              task.status = 'past deadline';
            } else {
              task.status = 'active';
            }

            $scope.tasks.push(task);
            $scope.newTask = '';

            storage.setItem('tasks', JSON.stringify($scope.tasks));
          }
        };

        $scope.completeTask = function(task) {
          task.completed = true;
          task.status = 'completed';

          storage.setItem('tasks', JSON.stringify($scope.tasks));
        };

        $scope.updateTaskStatus = function() {
          var currentDate = new Date();

          $scope.tasks.forEach(function(task) {
            if (task.status === 'scheduled' && task.deadline <= currentDate) {
              task.status = 'active';
            } else if (task.status === 'active' && task.deadline < currentDate) {
              task.status = 'past deadline';
            }
          });
        };

        $scope.showDeadlineAlert = function(task) {
          var currentDate = new Date();
          var deadline = new Date(task.deadline);
          var alertThreshold = new Date(deadline.getTime() - (60 * 60 * 1000)); // One hour before deadline

          if (task.status !== 'completed' && currentDate > alertThreshold) {
            if (!task.notified) {
              task.notified = true;
              showNotification('Deadline Alert', 'Task "' + task.title + '" is due in one hour!');
            }
            return true;
          }

          if (task.status === 'active' && currentDate > deadline) {
            if (!task.notified) {
              task.notified = true;
              showNotification('Deadline Alert', 'Task "' + task.title + '" is due now!');
            }
            return true;
          }

          return false;
        };

        $interval($scope.updateTaskStatus, 1000); // Check task statuses periodically

        $interval(function() {
          $scope.tasks.forEach(function(task) {
            $scope.showDeadlineAlert(task);
          });
        }, 60000); // Check for task notifications every minute

        // Load tasks from storage or initialize an empty array
        $scope.tasks = JSON.parse(storage.getItem('tasks')) || [];

        // Function to show browser notification
        function showNotification(title, message) {
          if (Notification.permission === 'granted') {
            new Notification(title, { body: message });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function(permission) {
              if (permission === 'granted') {
                new Notification(title, { body: message });
              }
            });
          }
        }

        // Request permission for browser notifications on page load
        if (Notification.permission !== 'granted') {
          Notification.requestPermission();
        }
      });