import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Calendar} from 'react-native-calendars';

const App = () => {
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);
  const [nextUnavailableDate, setNextUnavailableDate] = React.useState(null);
  const [selectedDates, setSelectedDates] = React.useState({});
  const disabledDates = [
    '2020-03-18',
    '2020-03-19',
    '2020-03-24',
    '2020-03-25',
    '2020-03-26',
    '2020-03-27',
  ];

  /*
    Create and object to mark sold out dates in the calendar
  */
  const disabledDatesObject = disabledDates.reduce(function(result, item) {
    result[item] = {disabled: true, disableTouchEvent: true};
    return result;
  }, {});

  /*
    If user picked a starting day, find the closest unavailable date to set it as an end of available period to select
  */
  const checkNextUnavailableDate = (start, disabledDatesArray) => {
    const date = new Date(start);
    for (let i = 0; i <= disabledDatesArray.length; i++) {
      if (date.getTime() < new Date(disabledDatesArray[i]).getTime()) {
        setNextUnavailableDate(disabledDatesArray[i]);
        break;
      }
    }
    return;
  };

  /*
    Get dates between starting day and ending day
  */
  const getDatesBetween = React.useCallback((start, end) => {
    const dates = [];
    const startingDay = new Date(start);
    startingDay.setDate(startingDay.getDate() + 1);
    const endingDay = new Date(end);

    while (startingDay.getTime() <= endingDay.getTime()) {
      dates.push(startingDay.toISOString().slice(0, 10));
      startingDay.setDate(startingDay.getDate() + 1);
    }

    return dates;
  }, []);

  /*
    Return an object with marking options for the calendar with selected dates
  */
  const makeDates = React.useCallback(
    (startingDay, endingDay) => {
      if (startingDay && !endingDay) {
        return {
          [startingDay]: {
            selected: true,
            startingDay: true,
            endingDay: true,
            color: '#5BA7B6',
          },
        };
      }

      if (startingDay) {
        const datesBetween = getDatesBetween(startingDay, endingDay);
        const datesBetweenObject = datesBetween.reduce(function(result, item) {
          result[item] = {selected: true, color: '#5BA7B6'};
          return result;
        }, {});
        return {
          [startingDay]: {
            selected: true,
            startingDay: true,
            color: '#5BA7B6',
          },
          ...datesBetweenObject,
          [endingDay]: {
            selected: true,
            endingDay: true,
            color: '#5BA7B6',
          },
        };
      }
    },
    [getDatesBetween],
  );

  /*
    Clear all.
  */
  const clearDates = React.useCallback(() => {
    setStartDate(null);
    setEndDate(null);
    setNextUnavailableDate(null);
    setSelectedDates({});
  }, []);

  /*
    Set all.
  */
  const setDates = React.useCallback(
    date => {
      if (endDate) {
        clearDates();
        return;
      }

      if (startDate) {
        if (new Date(startDate).getTime() <= new Date(date).getTime()) {
          setEndDate(date);
          setSelectedDates(makeDates(startDate, date));
          return;
        }
      }

      checkNextUnavailableDate(date, disabledDates);
      setStartDate(date);
      setSelectedDates(makeDates(date, null));
    },
    [endDate, startDate, disabledDates, makeDates, clearDates],
  );

  return (
    <View style={styles.wrapper}>
      <Calendar
        current={'2020-03-01'}
        minDate={startDate ? startDate : new Date()}
        maxDate={nextUnavailableDate ? nextUnavailableDate : undefined}
        onDayPress={day => setDates(day.dateString)}
        markedDates={{...disabledDatesObject, ...selectedDates}}
        markingType={'period'}
      />
      <TouchableOpacity onPress={clearDates}>
        <Text>Clear dates</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    padding: 10,
    paddingTop: 80,
  },
});

export default App;
