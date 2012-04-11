'''
Created on 2012-4-9

@author: xmxjq
'''
import hashlib

class TraceNode(object):
    '''
        TraceNode is the Simple class for every Trace point.
        It contains one parent and several children.
        The parent is limited to one in order to may the trace route a tree.
        May lose some information but it is more easy to visualize.
    '''

    def __init__(self, url, parentnode):
        self.url = url
        self.__urlhash = hashlib.md5(url).hexdigest()
        if not parentnode is None:
            self.__parentnode = parentnode
            self.layer = parentnode.layer + 1
        else:
            self.__parentnode = None
            self.layer = 0
        
        self.__childrenNodelist = []
        
    def addChildNode(self, childnode):
        self.__childrenNodelist.append(childnode)
        
    def printNodeInfo(self):
        if not self.__parentnode is None:
            print self.__parentnode.layer,":",
            print self.__parentnode.url,
            print "->",
            
        print self.layer,":",
        print self.url