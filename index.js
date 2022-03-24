exports.handler = async(event, context) => {

    date1 = new Date("06/30/2019");
    date2 = new Date("07/30/2019");

    // To calculate the time difference of two dates
    Difference_In_Time = date2.getTime() - date1.getTime();

    // To calculate the no. of days between two dates
    Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    console.log(`"${Difference_In_Days}`);
}