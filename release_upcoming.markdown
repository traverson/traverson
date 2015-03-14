media type plug-ins: step.uri -> step.url (step.uri will continue to work for now)
getUri -> getUrl (but getUri is kept around as an alias)

X An undocumented behaviour has been removed: In case of an error, the
  callback has sometimes been called with more than one argument (the error),
  namely with the last response and the last URL that had been accessed before
  the error occured. If you relied on this behaviour, then this is a breaking
  change.


