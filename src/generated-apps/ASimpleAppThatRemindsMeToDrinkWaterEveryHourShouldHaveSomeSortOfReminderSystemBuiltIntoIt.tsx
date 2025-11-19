import React, { useState, useEffect, useCallback } from 'react';

export const ASimpleAppThatRemindsMeToDrinkWaterEveryHourShouldHaveSomeSortOfReminderSystemBuiltIntoIt: React.FC = () => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [waterCount, setWaterCount] = useState<number>(0);
  const [lastDrinkTime, setLastDrinkTime] = useState<Date | null>(null);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [timeUntilNext, setTimeUntilNext] = useState<string>('');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async (): Promise<void> => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const showReminderNotification = useCallback((): void => {
    setShowNotification(true);
    
    if (notificationPermission === 'granted') {
      new Notification('💧 Water Reminder', {
        body: 'Time to drink some water! Stay hydrated!',
        icon: '💧',
        tag: 'water-reminder'
      });
    }

    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKng77RgGwU7k9r0z3ksBS1+zPDajzsKElyx6OyrWBUIRJzd8sJqHwU');
    audio.play().catch(() => {});

    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  }, [notificationPermission]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && lastDrinkTime) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const nextReminder = lastDrinkTime.getTime() + 3600000;
        
        if (now >= nextReminder) {
          showReminderNotification();
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, lastDrinkTime, showReminderNotification]);

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;

    if (isActive && lastDrinkTime) {
      countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const nextReminder = lastDrinkTime.getTime() + 3600000;
        const distance = nextReminder - now;

        if (distance < 0) {
          setTimeUntilNext('Time to drink water!');
        } else {
          const minutes = Math.floor((distance % 3600000) / 60000);
          const seconds = Math.floor((distance % 60000) / 1000);
          setTimeUntilNext(`${minutes}m ${seconds}s`);
        }
      }, 1000);
    }

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [isActive, lastDrinkTime]);

  const handleStart = (): void => {
    setIsActive(true);
    const now = new Date();
    setLastDrinkTime(now);
  };

  const handleStop = (): void => {
    setIsActive(false);
    setTimeUntilNext('');
  };

  const handleDrankWater = (): void => {
    const now = new Date();
    setWaterCount(prev => prev + 1);
    setLastDrinkTime(now);
    setShowNotification(false);
  };

  const handleReset = (): void => {
    setIsActive(false);
    setWaterCount(0);
    setLastDrinkTime(null);
    setShowNotification(false);
    setTimeUntilNext('');
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full">
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">💧</div>
          <h1 className="text-2xl font-bold text-blue-600 mb-1">Water Reminder</h1>
          <p className="text-sm text-gray-600">Stay hydrated, stay healthy</p>
        </div>

        {showNotification && (
          <div className="mb-4 bg-blue-500 text-white p-3 rounded-xl animate-pulse">
            <p className="text-center font-semibold text-sm">💧 Time to drink water!</p>
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl p-4 mb-4">
          <div className="text-center">
            <p className="text-gray-700 text-sm mb-2">Glasses Today</p>
            <p className="text-5xl font-bold text-blue-600">{waterCount}</p>
          </div>
        </div>

        {isActive && timeUntilNext && (
          <div className="bg-gray-50 rounded-xl p-3 mb-4 text-center">
            <p className="text-gray-600 text-xs mb-1">Next reminder in:</p>
            <p className="text-xl font-semibold text-blue-600">{timeUntilNext}</p>
          </div>
        )}

        <div className="space-y-2 mb-4">
          {!isActive ? (
            <button
              onClick={handleStart}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-colors duration-200 shadow-lg text-sm"
            >
              Start Reminders
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors duration-200 shadow-lg text-sm"
            >
              Stop Reminders
            </button>
          )}

          <button
            onClick={handleDrankWater}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-xl transition-colors duration-200 shadow-lg text-sm"
          >
            I Drank Water! 💧
          </button>

          <button
            onClick={handleReset}
            className="w-full bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-xl transition-colors duration-200 text-sm"
          >
            Reset Counter
          </button>
        </div>

        {notificationPermission !== 'granted' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-3">
            <p className="text-xs text-yellow-800 mb-2">Enable notifications for reminders!</p>
            <button
              onClick={requestNotificationPermission}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg transition-colors duration-200 text-xs"
            >
              Enable Notifications
            </button>
          </div>
        )}

        <div className="text-center text-xs text-gray-500">
          <p>Recommended: 8 glasses per day</p>
        </div>
      </div>
    </div>
  );
};