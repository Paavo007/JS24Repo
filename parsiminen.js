try {
    let number = 10;
    let result = number / someUndefinedVariable;
    console.log(result);
} catch (error) {
    console.log("Virhe tapahtui: " + error.message);
} finally {
    console.log("Tämä suoritetaan aina.");
}