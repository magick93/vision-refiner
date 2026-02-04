# Initial Concept

This project is a web-based "vision refiner" application built with SvelteKit.

## Scenario

When our customers generate images, we want to provide contextual suggestions for
further edits they could make to the image.

## Pipeline

a pipeline that:

* Generates an image in response to a user prompt
*  Performs analysis on the generated image to produce a contextual set of "suggested edits", including (where applicable)
* * Identify objects in the image that the user may wish to remove
* * Change time of day (e.g., "Convert to golden hour lighting" or "Make it
nighttime")
* * Modify weather conditions (add/remove rain, fog, sunshine, etc.)
* * Suggest different perspectives, angles, or crops
*  Produces a new version of the image that applies the chosen edit